const chai = require('chai');
const request = require('supertest');
const server = require('../../server');
const User = require('../../models/user');
const Document = require('../../models/document');
const Confirmation = require('../../models/confirmation');
const expect = chai.expect;

var url = '/api/confirmations';
var tokenUser1 = '';
var tokenUser2 = '';
var docId = '';

describe('Confirmations router test !', function (done) {
    this.timeout(10000);

    // 회원 가입 후 로그인
    before((done) => {
        var user1 = {
            email: 'wwlee94@naver.com',
            password: 'password',
            passwordConfirm: 'password'
        };
        var user2 = {
            email: 'dlfighk1028@naver.com',
            password: 'password',
            passwordConfirm: 'password'
        };
        //첫번째 유저 생성
        new User(user1).save()
            .then(user => {
                request(server).post('/api/auth/login')
                    .send({
                        email: user1.email,
                        password: user1.password
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        tokenUser1 = res.body.data.token;
                        //두번째 유저 생성
                        new User(user2).save()
                            .then(user => {
                                request(server).post('/api/auth/login')
                                    .send({
                                        email: user2.email,
                                        password: user2.password
                                    })
                                    .expect(200)
                                    .end((err, res) => {
                                        if (err) done(err);
                                        tokenUser2 = res.body.data.token;
                                        done();
                                    });
                            });
                    });
            });
        createDocuments();
    });

    after(() => {
        User.collection.drop();
        Document.collection.drop();
        Confirmation.collection.drop();
    });

    describe('POST / 요청은', () => {
        it('유효한 문서 ID가 아니면 "InvalidParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                .send({
                    id: '5e07a0eb3d439a8bc1341142',
                    email: 'wwlee94@naver.com',
                    conmment: '내용은 다음과 같습니다!',
                    confirmation: 'CANCELED'
                })
                .expect(422)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(422);
                    expect(res.body.error.name).to.be.equal('InvalidParameterError');
                    done();
                });
        });

        it('이미 승인되거나 거절된 문서를 결재 요청 했을 경우 "InvalidParameterError" 에러를 발생시킨다.', done => {
            Document.findOne({ userEmail: 'dlfighk1028@naver.com' })
                .then(doc => {
                    docId = doc._id;
                    request(server).post(url)
                        .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                        .send({
                            id: doc._id,
                            email: 'wwlee94@naver.com',
                            conmment: '내용은 다음과 같습니다!',
                            confirmation: 'CANCELED'
                        })
                        .expect(422)
                        .end((err, res) => {
                            if (err) done(err);
                            expect(res.body.error.status).to.be.equal(422);
                            expect(res.body.error.name).to.be.equal('InvalidParameterError');
                            done();
                        });
                });
        });

        it('결재 차례가 아닐 경우 "InvalidParameterError" 에러를 발생시킨다.', done => {
            Document.findOne({ userEmail: 'wjdtjddus1109@naver.com' })
                .then(doc => {
                    docId = doc._id;
                    request(server).post(url)
                        .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                        .send({
                            id: docId,
                            email: 'dlfighk1028@naver.com',
                            conmment: '내용은 다음과 같습니다!',
                            confirmation: 'CANCELED'
                        })
                        .expect(422)
                        .end((err, res) => {
                            if (err) done(err);
                            expect(res.body.error.status).to.be.equal(422);
                            expect(res.body.error.name).to.be.equal('InvalidParameterError');
                            done();
                        });
                });
        });

        it('에러가 없을 경우 새로운 Confirmation(결재 확인)을 생성한다. (문서는 모두 승인되면 승인으로, 한명이라도 취소되면 취소로 변경된다)', done => {
            Document.findOne({ userEmail: 'wjdtjddus1109@naver.com' })
                .then(doc => {
                    docId = doc._id;
                    request(server).post(url)
                        .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                        .send({
                            id: docId,
                            email: 'wwlee94@naver.com',
                            conmment: '내용은 다음과 같습니다!',
                            confirmation: 'CANCELED'
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) done(err);
                            Document.find({ _id: docId })
                                .then(doc => {
                                    expect(res.body.status).to.be.equal(200);
                                    expect(doc).to.have.lengthOf(1);
                                    expect(doc[0].type).to.be.equal('CANCELED');
                                    done();
                                });
                        });
                });
        });
    });

    describe('GET / 요청은', () => {
        it('에러가 없다면 자신이 결재 요청했던(생성했던) 문서 내역 검색', done => {
            request(server).get(url)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                .query({
                    email: 'wwlee94@naver.com'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0].confirmation).to.be.equal('CANCELED'); // 특정 유저의 결재 확인 상태
                    expect(res.body.data[0].document.type).to.be.equal('CANCELED'); // 결재 문서의 상태
                    done();
                });
        });
    });
});

function createDocuments() {
    var document1 = {
        userEmail: "wwlee94@naver.com",
        title: "첫번째 문서 입니다.",
        type: "RUNNING",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["wjdtjddus1109@naver.com", "dlfighk1028@naver.com"]
    };
    var document2 = {
        userEmail: "wjdtjddus1109@naver.com",
        title: "두번째 문서 입니다.",
        type: "RUNNING",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["wwlee94@naver.com", "dlfighk1028@naver.com"]
    };
    var document3 = {
        userEmail: "dlfighk1028@naver.com",
        title: "세번째 문서 입니다.",
        type: "APPROVED",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["wwlee94@naver.com"]
    };
    var document4 = {
        userEmail: "wwlee94@naver.com",
        title: "네번째 문서 입니다.",
        type: "CANCELED",
        content: "내용은 다음과 같습니다!",
        confirmationOrder: ["check@naver.com"]
    };
    createDocument(document1);
    createDocument(document2);
    createDocument(document3);
    createDocument(document4);
}

function createDocument(document) {
    new Document(document).save();
};