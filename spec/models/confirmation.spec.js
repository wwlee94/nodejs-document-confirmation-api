const chai = require('chai');
const Confirmation = require('../../models/confirmation');
const expect = chai.expect

describe('Confirmation model test !', function (done) {
    this.timeout(10000);

    it('document reference id가 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var confirm = new Confirmation();

        //2. validate 실행
        confirm.validate(err => {
            expect(err.errors.document).to.exist;
            done();
        });
    });

    it('userEmail이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var confirm = new Confirmation({
            document: '5e07a0eb3d439a8bc1341142' //ObjectId
        });

        //2. validate 실행
        confirm.validate(err => {
            expect(err.errors.userEmail).to.exist;
            done();
        });
    });

    it('confirmation이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var confirm = new Confirmation({
            document: '5e07a0eb3d4', //ObjectId
            userEmail: 'wwlee94@naver.com'
        });

        //2. validate 실행
        confirm.validate(err => {
            expect(err.errors.confirmation).to.exist;
            done();
        });
    });
});