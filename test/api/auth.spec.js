const chai = require('chai');
const request = require('supertest');
// const nock = require('nock');
const Util = require('../../utils/util');
const Document = require('../../api/documents');
const Auth = require('../../api/auth');
const User = require('../../api/users');

const server = require('../../server');

var expect = chai.expect;
describe('auth router test !', () => {
    var baseUrl = 'http://localhost:4000';
    var login = '/api/auth/login';
    // before(() => {
    //     var loginMock = {
    //         status: 200,
    //         data: {
    //             token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTAzN2YzOTNjY2RkZTRhMzUyMzFkMjMiLCJlbWFpbCI6Ind3bGVlOTRAbmF2ZXIuY29tIiwiaWF0IjoxNTc3NTE4Mjk5LCJleHAiOjE1Nzc1MjE4OTl9.8XXDrddeCz1AoNEXoF08aIGJRDcUCtBEp3y7yaaB1jU'
    //         }
    //     };
    //     nock(baseUrl).post(login)
    //         .reply(200, loginMock);

    // });
    // after('Clean up facebook api mock', function () {
    //     // nock 설정을 해제한다
    //     nock.cleanAll();
    // });
    describe('POST /login 요청은', function (done) {
        this.timeout(10000);

        it('에러가 없다면 사용자에게 Token을 발급한다.', function (done) {
            request(baseUrl).post(login)
                .send({
                    email: 'wwlee94@naver.com',
                    password: 'password1'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.data).to.have.property('token');
                    done();
                });
        });

        it('email 또는 password 파라미터가 없으면 "NotFoundParameterError" 에러를 발생시킨다.', function (done) {
            request(baseUrl).post(login)
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

        it('등록되어 있는 이메일이 아니라면 "InvalidParameterError" 에러를 발생시킨다.', function (done) {
            request(baseUrl).post(login)
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

        it('패스워드가 틀렸을 경우 "Forbidden" 에러를 발생시킨다.', function (done) {
            request(baseUrl).post(login)
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