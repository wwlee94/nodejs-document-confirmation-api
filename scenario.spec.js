const chai = require('chai');
const request = require('supertest');
const server = require('./server');
const User = require('./models/user');
const Document = require('./models/document');
const Confirmation = require('./models/confirmation');
const expect = chai.expect;

var authUrl = '/api/auth/login';
var userUrl = '/api/users';
var documentUrl = '/api/documents';
var confirmUrl = '/api/confirmations';

// 계정 로그인 후 발급 받은 토큰
var newUser_Token;
var secondUser_Token;
// 결재 문서 id
var firstDocId;
var secondDocId;
// 결재 id
var firstConfirmId;

// 오류, 예외 처리에 대한 Spec은 spec/api 폴더를 참고 바랍니다. - 아래의 시나리오는 요구 사항에 해당되는 기능이 잘 동작하는지에 대한 spec입니다.
describe('문서 결재 시나리오: [ 회원가입 -> 로그인 -> 결재문서 생성 -> 결재할 문서 목록조회 -> 문서 결재 -> 결재문서 상세조회 ]', function (done) {
    this.timeout(10000);

    after(() => {
        User.collection.drop();
        Document.collection.drop();
        Confirmation.collection.drop();
    });

    describe('회원가입 API 호출 - POST /api/users', done => {
        it('회원가입 하기', done => {
            request(server).post(userUrl)
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser',
                    passwordConfirm: 'newUser'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('가입되었는지 확인', done => {
            User.findOne({ email: 'newUser@naver.com' })
                .then(user => {
                    expect(user.email).to.be.equal('newUser@naver.com');
                    done();
                });
        });
    });

    describe('로그인 API 호출 - POST /api/auth/login', done => {
        it('로그인하고 토큰 발급 받기', done => {
            request(server).post(authUrl)
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    newUser_Token = res.body.data.token;
                    done();
                });
        });
    });

    describe('문서 결재 요청 API 호출 - POST /api/documents', done => {
        before(done => {
            //계정을 생성안하면 아래 결재 요청 '* 표시'에 없는 계정을 넣으면 validation 걸림 따라서 secondUser 생성 및 토큰 발급
            request(server).post(userUrl)
                .send({
                    email: 'secondUser@naver.com',
                    password: 'secondUser',
                    passwordConfirm: 'secondUser'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    request(server).post(authUrl)
                        .send({
                            email: 'secondUser@naver.com',
                            password: 'secondUser'
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            secondUser_Token = res.body.data.token;
                            done();
                        });
                });
        });
        it('결재 요청하기', done => {
            request(server).post(documentUrl)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .send({
                    email: 'newUser@naver.com',
                    title: '첫번째 문서 입니다.',
                    content: '내용은 다음과 같습니다!',
                    order: 'secondUser@naver.com'   //*
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('생성된 결재 문서 조회하기', done => {
            Document.findOne({ userEmail: 'newUser@naver.com' })
                .then(doc => {
                    firstDocId = doc._id.toString();
                    expect(doc.userEmail).to.be.equal('newUser@naver.com');
                    expect(doc.title).to.be.equal('첫번째 문서 입니다.');
                    expect(doc.type).to.be.equal('RUNNING');
                    done();
                });
        });
    });

    describe('문서 조회 API 호출 - GET /api/documents', done => {
        before(done => {
            createDocuments(done);
        });

        it('OUTBOX 조건의 문서 조회 - 진행중이고 내가 생성한 문서', done => {
            request(server).get(documentUrl)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .query({
                    email: 'newUser@naver.com',
                    type: "OUTBOX"
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].userEmail).to.be.equal('newUser@naver.com');
                    expect(res.body.data[0].type).to.be.equal('RUNNING');
                    done();
                });
        });

        it('INBOX 조건의 문서 조회 - 결재를 해야할 문서', done => {
            request(server).get(documentUrl)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .query({
                    email: 'newUser@naver.com',
                    type: "INBOX"
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].userEmail).to.be.equal('wwlee94@naver.com');
                    expect(res.body.data[0].confirmationOrder).to.include('newUser@naver.com');
                    expect(res.body.data[0].type).to.be.equal('RUNNING');
                    // 결재할 docId 저장
                    secondDocId = res.body.data[0]._id;
                    done();
                });
        });

        it('ARCHIVE 조건의 문서 조회 - 승인 또는 취소된 내가 생성하거나 관여했던 문서', done => {
            request(server).get(documentUrl)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .query({
                    email: 'newUser@naver.com',
                    type: "ARCHIVE"
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].userEmail).to.be.equal('wjdtjddus1109@naver.com');
                    expect(res.body.data[0].confirmationOrder).to.include('newUser@naver.com');
                    expect(res.body.data[0].type).to.be.equal('APPROVED');
                    done();
                });
        });
    });

    describe('문서 결재 API 호출 - POST /api/confirmations', done => {
        describe('newUser의 결재 취소 시나리오', done => {
            it('newUser가 결재 해야할 "두번째 문서"를 취소 처리', done => {
                request(server).post(confirmUrl)
                    .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                    .send({
                        id: secondDocId,
                        email: 'newUser@naver.com',
                        comment: '블라블라한 사유에 따라 결재 취소합니다.',
                        confirmation: 'CANCELED'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        done();
                    });
            });

            it('결재 취소로 생성된 Confirmation 정보 확인', done => {
                Confirmation.findOne({ userEmail: 'newUser@naver.com' })
                    .then(confirm => {
                        firstConfirmId = confirm._id;
                        expect(confirm.document.toString()).to.be.equal(secondDocId);
                        expect(confirm.userEmail).to.be.equal('newUser@naver.com');
                        expect(confirm.confirmation).to.be.equal('CANCELED');
                        done();
                    });
            });

            it('결재 취소로 변경된 Document 상태 확인 - Document(결재 문서)도 함께 취소', done => {
                Document.findOne({ _id: secondDocId })
                    .then(doc => {
                        expect(doc.type).to.be.equal('CANCELED');
                        done();
                    });
            });
        });

        describe('secondUser의 결재 승인 시나리오', done => {
            it('secondUser가 결재 해야할 "첫번째 문서"를 승인 처리', done => {
                request(server).post(confirmUrl)
                    .set({ 'x-access-token': secondUser_Token, Accept: 'application/json' })
                    .send({
                        id: firstDocId,
                        email: 'secondUser@naver.com',
                        comment: '블라블라한 사유에 따라 결재 승인합니다. 수고하셨습니다 !',
                        confirmation: 'APPROVED'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        done();
                    });
            });

            it('결재 승인으로 생성된 Confirmation 정보 확인', done => {
                Confirmation.findOne({ userEmail: 'secondUser@naver.com' })
                    .then(confirm => {
                        firstConfirmId = confirm._id;
                        expect(confirm.document.toString()).to.be.equal(firstDocId);
                        expect(confirm.userEmail).to.be.equal('secondUser@naver.com');
                        expect(confirm.confirmation).to.be.equal('APPROVED');
                        done();
                    });
            });

            it('결재 승인로 변경된 Document 상태 확인 - 해당 문서는 결재자가 1명이라 Document(결재 문서)는 승인 상태로 변경', done => {
                Document.findOne({ _id: firstDocId })
                    .then(doc => {
                        expect(doc.type).to.be.equal('APPROVED');
                        done();
                    });
            });
        });
    });

    describe('문서 상세 보기 API 호출 - GET /api/documents/:id', done => {
        it('"첫번째 문서" 상세조회 - 기본정보 + 내용, 생성일, 업데이트일, 누가 승인하고 취소 했는지(confirmedUsers)', done => {
            request(server).get(`${documentUrl}/${firstDocId}`)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);                    
                    expect(res.body.status).to.be.equal(200);                
                    expect(res.body.data).include.all.keys(['_id', 'content', 'createdAt', 'updatedAt']);
                    expect(res.body.data.userEmail).to.be.equal('newUser@naver.com');
                    expect(res.body.data.type).to.be.equal('APPROVED');
                    //결재자 정보
                    confirmUser = res.body.data.confirmedUsers[0];
                    expect(confirmUser.userEmail).to.be.equal('secondUser@naver.com');
                    expect(confirmUser.confirmation).to.be.equal('APPROVED');
                    done();
                });
        });

        it('"두번째 문서" 상세조회 - 기본정보 + 내용, 생성일, 업데이트일, 누가 승인하고 취소 했는지(confirmedUsers)', done => {
            request(server).get(`${documentUrl}/${secondDocId}`)
                .set({ 'x-access-token': newUser_Token, Accept: 'application/json' })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);                    
                    expect(res.body.status).to.be.equal(200);                
                    expect(res.body.data).include.all.keys(['_id', 'content', 'createdAt', 'updatedAt']);
                    expect(res.body.data.confirmationOrder).to.include('newUser@naver.com');
                    expect(res.body.data.type).to.be.equal('CANCELED');
                    //결재자 정보
                    confirmUser = res.body.data.confirmedUsers[0];
                    expect(confirmUser.userEmail).to.be.equal('newUser@naver.com');
                    expect(confirmUser.confirmation).to.be.equal('CANCELED');
                    done();
                });
        });
    });
    // 내가 결재했던 목록도 조회 가능 - 테스트가 너무 많아 생략
    // GET /api/confirmations
});

function createDocuments(done) {
    var document1 = {
        userEmail: "wwlee94@naver.com",
        title: "두번째 문서 입니다.",
        type: "RUNNING",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["newUser@naver.com", "dlfighk1028@naver.com"]
    };
    var document2 = {
        userEmail: "wjdtjddus1109@naver.com",
        title: "세번째 문서 입니다.",
        type: "APPROVED",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["newUser@naver.com", "dlfighk1028@naver.com"]
    };
    createDocument(document1)
        .then(doc => {
            createDocument(document2)
            done();
        });
}

function createDocument(document) {
    return new Document(document).save();
};