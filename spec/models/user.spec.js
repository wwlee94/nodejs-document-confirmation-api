const chai = require('chai');
const request = require('supertest');
const server = require('../../server');
const User = require('../../models/user');
const expect = chai.expect

describe('User model test !', function (done) {
    this.timeout(10000);

    before(() => {
        request(server);
    });

    after(() => {
        User.collection.drop();
    });

    it('email이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var user = new User();

        //2. validate 실행
        user.validate(err => {
            expect(err.errors.email).to.exist;
            done();
        });
    });

    it('email 형태(@)가 아니라면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var user = new User({ email: 'wwlee94' });

        //2. validate 실행
        user.validate(err => {
            expect(err.errors.email).to.exist;
            done();
        });
    });

    it('password가 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var user = new User({ email: 'wwlee94@naver.com' });

        //2. validate 실행
        user.validate(err => {
            expect(err.errors.password).to.exist;
            done();
        });
    });

    it('passwordConfirm이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var user = new User({
            email: 'wwlee94@naver.com',
            password: 'password'
        });

        //2. validate 실행
        user.validate(err => {
            expect(err.errors._passwordConfirm).to.exist;
            done();
        });
    });

    it('password와 passwordConfirm이 일치하지 않으면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var user = new User({
            email: 'wwlee94@naver.com',
            password: 'password',
            passwordConfirm: 'passwordConfirm'
        });

        //2. validate 실행
        user.validate(err => {
            expect(err.errors._passwordConfirm).to.exist;
            done();
        });
    });

    var instanceUser;
    it('에러가 없다면 새로운 User 생성', done => {
        var user = new User({
            email: 'wwlee94@naver.com',
            password: 'password',
            passwordConfirm: 'password'
        });
        user.save()
            .then(user => {
                instanceUser = user;
                expect(user.email).to.be.equal('wwlee94@naver.com');
                done();
            })
    });

    it('"authenticatePassword" 메소드 테스트', done => {
        expect(instanceUser.authenticatePassword('password')).to.be.true
        done();
    });
});