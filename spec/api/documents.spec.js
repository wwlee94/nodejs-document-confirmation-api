const chai = require('chai');
const request = require('supertest');
const server = require('../../server');
const User = require('../../models/user');
const Document = require('../../models/document');
const Confirmation = require('../../models/confirmation');
const expect = chai.expect;

var tokenUser1 = '';
var tokenUser2 = '';
var docId = '';

describe('Documents router test !', function (done) {
    this.timeout(15000);
    var url = '/api/documents';

    // 회원 가입 후 로그인
    before((done) => {
        var info = {
            email: 'wwlee94@naver.com',
            password: 'password',
            passwordConfirm: 'password'
        };
        new User(info).save()
            .then(user => {
                request(server).post('/api/auth/login')
                    .send({
                        email: info.email,
                        password: info.password
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        tokenUser1 = res.body.data.token;
                        done();
                    });
            });
        createDocuments();
    });

    after(() => {
        User.collection.drop();
        Document.collection.drop();
    });

    describe('GET / 요청은', () => {
        describe('에러가 없다면 요청 타입(OUTBOX, INBOX, ARCHIVE)에 따라 결재 서류 목록을 반환', done => {
            it('"OUTBOX" 일 경우 "내가 생성한 문서 중 결재 진행 중인 문서를 반환"', done => {
                request(server).get(url)
                    .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                    .query({
                        email: 'wwlee94@naver.com',
                        type: "OUTBOX"
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res.body.status).to.be.equal(200);
                        expect(res.body.data).to.have.lengthOf(1);
                        expect(res.body.data[0].userEmail).to.be.equal('wwlee94@naver.com');
                        expect(res.body.data[0].type).to.be.equal('RUNNING');
                        done();
                    });
            });

            it('"INBOX" 일 경우 "내가 결재를 해야 할 문서"', done => {
                request(server).get(url)
                    .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                    .query({
                        email: 'wwlee94@naver.com',
                        type: "INBOX"
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res.body.status).to.be.equal(200);
                        expect(res.body.data).to.have.lengthOf(1);
                        expect(res.body.data[0].confirmationOrder).to.include('wwlee94@naver.com');
                        expect(res.body.data[0].type).to.be.equal('RUNNING');
                        done();
                    });
            });

            it('"ARCHIVE" 일 경우 "내가 관여한 문서(내가 생성한 문서이거나 결재 지목을 받은 문서) 중 결재가 완료(승인 또는 거절)된 문서"', done => {
                request(server).get(url)
                    .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                    .query({
                        email: 'wwlee94@naver.com',
                        type: "ARCHIVE"
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res.body.status).to.be.equal(200);
                        expect(res.body.data).to.have.lengthOf(2);
                        expect(res.body.data[0].confirmationOrder).to.include('wwlee94@naver.com');
                        expect(res.body.data[0].type).to.be.equal('APPROVED');
                        expect(res.body.data[1].userEmail).to.equal('wwlee94@naver.com');
                        expect(res.body.data[1].type).to.be.equal('CANCELED');
                        done();
                    });
            });
        });
    });

    describe('GET /:id 요청은', done => {
        before(done => {
            Document.findOne({ userEmail: 'wwlee94@naver.com' })
                .then(doc => {
                    docId = doc._id;
                    done();
                    // var confirm = {
                    //     document: docId,
                    //     userEmail: 'wjdtjddus1109@naver.com',
                    //     confirmation: "APPROVED"
                    // };
                    // new Confirmation(confirm).save()
                    //     .then(confirm => {
                    //         done();
                    //     });
                });
        });
        it('결재 서류의 세부 정보를 반환한다. (content, createdAt, updatedAt 등등)', done => {
            var showUrl = `${url}/${docId}`
            request(server).get(showUrl)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).include.all.keys(['_id', 'content', 'createdAt', 'updatedAt']);
                    done();
                });
        });

        it('문서의 세부정보 조회시 문서와 관련된 사용자들만 조회 가능하도록 권한 확인', done => {
            var info = {
                email: 'user2@naver.com',
                password: 'password',
                passwordConfirm: 'password'
            };
            new User(info).save()
                .then(user => {
                    request(server).post('/api/auth/login')
                        .send({
                            email: info.email,
                            password: info.password
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) done(err);
                            tokenUser2 = res.body.data.token;
                            var showUrl = `${url}/${docId}`
                            request(server).get(showUrl)
                                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                                .expect(403)
                                .end((err, res) => {
                                    if (err) done(err);
                                    expect(res.body.error.status).to.be.equal(403);
                                    expect(res.body.error.name).to.be.equal('Forbidden');
                                    done();
                                });
                        });
                });
        });
    });

    describe('POST / 요청은', () => {
        it('에러가 없을 경우 새로운 Document를 생성한다.', done => {
            request(server).post(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'user2@naver.com',
                    title: '다섯번째 문서 입니다.',
                    content: '내용은 다음과 같습니다!',
                    order: 'wwlee94@naver.com'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    Document.find({ userEmail: 'user2@naver.com' })
                        .then(doc => {
                            expect(doc).to.have.lengthOf(1);
                            done();
                        });
                });
        });

        it('발급 받은 토큰의 이메일 정보와 입력한 이메일이 일치하지 않을 경우 "InvalidTokenError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'notMatchEmail@naver.com',
                    title: '다섯번째 문서 입니다.',
                    content: '내용은 다음과 같습니다!',
                    order: 'wwlee94@naver.com'
                })
                .expect(401)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(401);
                    expect(res.body.error.name).to.be.equal('InvalidTokenError');
                    done();
                });
        });

        it('존재하지 않는 이메일일 경우 "InvalidParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'user2@naver.com',
                    title: '다섯번째 문서 입니다.',
                    content: '내용은 다음과 같습니다!',
                    order: 'wwlee94@naver.com, notFoundUser@naver.com'
                })
                .expect(422)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(422);
                    expect(res.body.error.name).to.be.equal('InvalidParameterError');
                    done();
                });
        });

        it('결재자를 입력하지 않으면 "InvalidParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'user2@naver.com',
                    title: '다섯번째 문서 입니다.',
                    content: '내용은 다음과 같습니다!',
                    order: ''
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