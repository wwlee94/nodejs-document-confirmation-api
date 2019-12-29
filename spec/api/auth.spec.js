const chai = require('chai');
const request = require('supertest');
const server = require('../../server');
const User = require('../../models/user');
const expect = chai.expect;
// const sinon = require('sinon');

var url = '/api/auth/login';
describe('Auth router test !', function (done) {
    this.timeout(10000);

    before((done) => {
        var user1 = {
            email: 'wwlee94@naver.com',
            password: 'password',
            passwordConfirm: 'password'
        };
        new User(user1).save()
            .then(user => {
                console.log('Save ValidUser !');
                done();
            });
    });

    after(() => {
        User.collection.drop();
    });

    describe('POST /login 요청은', () => {

        it('에러가 없다면 사용자에게 Token을 발급한다.', done => {
            request(server).post(url)
                .send({
                    email: 'wwlee94@naver.com',
                    password: 'password'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    console.log(res.body);
                    expect(res.body.data).to.have.property('token');
                    done();
                });
        });

        it('email 또는 password 파라미터가 없으면 "NotFoundParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .send({
                    email: 'wwlee94@naver.com'
                })
                .expect(400)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(400);
                    expect(res.body.error.name).to.be.equal('NotFoundParameterError');
                    done();
                });
        });

        it('등록되어 있는 이메일이 아니라면 "InvalidParameterError" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .send({
                    email: 'notRegisteredEmail@naver.com',
                    password: 'notRegisteredEmail'
                })
                .expect(422)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.error.status).to.be.equal(422);
                    expect(res.body.error.name).to.be.equal('InvalidParameterError');
                    done();
                });
        });

        it('패스워드가 틀렸을 경우 "Forbidden" 에러를 발생시킨다.', done => {
            request(server).post(url)
                .send({
                    email: 'wwlee94@naver.com',
                    password: 'invalidPassword'
                })
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