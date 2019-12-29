const chai = require('chai');
const Document = require('../../models/document');
const expect = chai.expect

describe('Document model test !', function (done) {
    this.timeout(10000);

    it('userEmail이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var doc = new Document();

        //2. validate 실행
        doc.validate(err => {
            expect(err.errors.userEmail).to.exist;
            done();
        });
    });

    it('title이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var doc = new Document({ userEmail: 'wwlee94@naver.com' });

        //2. validate 실행
        doc.validate(err => {
            expect(err.errors.title).to.exist;
            done();
        });
    });

    it('content(내용)이 없다면 validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var doc = new Document({
            userEmail: 'wwlee94@naver.com',
            title: '첫번째 문서입니다.'
        });

        //2. validate 실행
        doc.validate(err => {
            expect(err.errors.content).to.exist;
            done();
        });
    });

    // it('type은 요청 값이 없다면 기본으로 "RUNNING" type으로 적용된다', done => {
    //     //1. 유효성 검사가 실패하도록 모델을 생성
    //     var doc = new Document({
    //         userEmail: 'wwlee94@naver.com',
    //         title: '첫번째 문서입니다.',
    //         content: '다음과 같습니다',
    //         confirmationOrder: 'wjdtjddus1109@naver.com'
    //     });

    //     doc.save()
    //         .then(doc => {
    //             expect(doc.type).to.be.equal('RUNNING');
    //             done();
    //         });
    // });

    it('결재자를 입력하지 않았다면(confirmationOrder) validation 에러를 발생시킨다.', done => {
        //1. 유효성 검사가 실패하도록 모델을 생성
        var doc = new Document({
            userEmail: 'wwlee94@naver.com',
            title: '첫번째 문서입니다.',
            content: '다음과 같습니다'
        });

        //2. validate 실행
        doc.validate(err => {
            expect(err.errors.confirmationOrder).to.exist;
            done();
        });
    });

});