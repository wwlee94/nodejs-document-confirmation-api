const chai = require('chai');
const request = require('supertest');
const server = require('../../server');
const User = require('../../models/user');
const expect = chai.expect;

describe('Users router test !', function (done) {
    this.timeout(10000);
    var url = '/api/users';
    var tokenUser1 = '';
    var tokenUser2 = '';

    // 회원 가입 후 로그인
    before((done) => {
        var info = {
            email: 'wwlee94@naver.com',
            password: 'password1',
            passwordConfirm: 'password1'
        };
        new User(info).save()
            .then(user => {
                console.log('Save ValidUser !');
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
    });

    after(() => {
        User.collection.drop();
    });

    describe('GET / 요청은', () => {
        it('에러가 없다면 로그인 된 유저 정보를 반환한다.', done => {
            request(server).get(url)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                .query({
                    email: 'wwlee94@naver.com'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(200);
                    expect(res.body.data).to.have.all.keys(['_id', 'email', 'createdAt', 'updatedAt']);
                    expect(res.body.data.email).to.be.equal('wwlee94@naver.com');
                    done();
                });
        });

        it('email 파라미터가 없으면 "NotFoundParameterError" 에러를 발생시킨다.', done => {
            request(server).get(url)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })
                .expect(400)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(400);
                    expect(res.body.error.name).to.be.equal('NotFoundParameterError');
                    done();
                });
        });
    });

    describe('POST / 요청은', () => {
        it('에러가 없다면 새로운 User를 생성한다.', done => {
            request(server).post(url)
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser',
                    passwordConfirm: 'newUser'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    User.findOne({ email: 'newUser@naver.com' })
                        .then(user => {
                            expect(user.email).to.be.equal('newUser@naver.com');
                            done();
                        });
                });
        });

        it('이미 요청한 이메일로 가입된 사용자가 있을 경우 "InvalidParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser',
                    passwordConfirm: 'newUser'
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

    describe('DELETE / 요청은', () => {
        before((done) => {
            request(server).post('/api/auth/login')
            .send({
                email: 'newUser@naver.com',
                password: 'newUser'
            })
            .expect(200)
            .end((err, res) => {
                if (err) done(err);
                tokenUser2 = res.body.data.token;
                done();
            });
        });

        it('삭제하려는 계정이 없을 경우 "NotFoundDataError" 에러를 발생시킨다.', done => {
            request(server).delete(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'notFoundUser@naver.com',
                    password: 'notFoundUser'
                })
                .expect(400)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(400);
                    expect(res.body.error.name).to.be.equal('NotFoundDataError');
                    done();
                });
        });

        it('토큰의 정보와 삭제하려는 유저의 정보가 다르다면 "Forbidden" 에러를 발생시킨다.', done => {
            request(server).delete(url)
                .set({ 'x-access-token': tokenUser1, Accept: 'application/json' })  //'wwlee94'계정의 토큰
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser'
                })
                .expect(403)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(403);
                    expect(res.body.error.name).to.be.equal('Forbidden');
                    done();
                });
        });

        it('에러가 없다면 요청한 계정을 삭제한다.', done => {
            request(server).delete(url)
                .set({ 'x-access-token': tokenUser2, Accept: 'application/json' })
                .send({
                    email: 'newUser@naver.com',
                    password: 'newUser'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    User.findOne({ email: 'newUser@naver.com' })
                        .then(user => {
                            expect(user).to.be.null;
                            done();
                        });
                });
        });
    });
});