### Header 옵션
보안상의 이유로 서버는 기본적으로 같은 서버가 아닌 다른 곳에서 오는 요청들을 기본적으로 차단합니다.  
또한 클라이언트에서 오는 요청도 다른곳으로 간주합니다.  
하지만 API는 클라이언트를 위한 프로그램이므로 같은 서버가 아닌 다른 곳에서 오는 요청들을 허가해야 하는데, 이것을 HTTP 접근 제어 혹은 CORS(Cross-origin resource sharing, 출처가 다른 곳끼리 자원 공유)라고 합니다.

1. Access-Control-Allow-Origin: 요청이 허용되는 url을 route을 제외하고 적습니다. 이외의 url로 부터 오는 요청은 거절됩니다. 단 *은 모든 요청을 허가시킵니다.
2. Access-Control-Allow-Methods:요청이 허용되는 HTTP verb 목록을 적습니다. 여기에 포함되지 않은 HTTP verb의 요청은 거절됩니다. *을 사용할 수 없습니다.
3. Access-Control-Allow-Headers: 요청이 허용되는 HTTP header 목록을 적습니다. 여기에 포함되지 않은 HTTP header는 사용할 수 없습니다.  *을 사용할 수 없습니다.

### body-parser
post로 요청된 body를 쉽게 추출할 수 있는 모듈

`app.use(bodyParser.urlencoded({extended: true}));`  
객체 안에 객체를 파싱할 수 있게하려면 extended: true  

## 자바스크립트 유틸 라이브러리
### Lodash
ES6를 사용하면 map, find, filter 등의 array functions가 제공되기 때문에 Lodash의 쓰임이 많이 줄긴 했습니다만.
여전이 array나 object 를 전처리, 파싱할 때 좋은 라이브러이입니다.

## NodeJS 프레임워크
### Express.js 
이 외 사용안한 다른 프레임워크: Koa

## 토큰 생성 모듈
### Jsonwebtoken -> JWT

## 해시 암호화 모듈
### crypt, bcrypt

## 환경 변수 관리하는 모듈
### Dotenv
.env 파일로 환경 변수를 한 곳에서 관리하도록 도와주는 모듈

## DB Access 모듈
### Mongoose

## Spec test 도듈
### Mocha, Chai, Supertest
이 외 사용안한 다른 테스트 모듈 Sinon, Nock 등

## 추가적으로 고민 해봐야 할 것들
1. Error 처리는 Throw로 처리해야 좋은가?
현재는 Thorw와 미들웨어로 메시지를 보내는 에러 처리 2가지가 사용됨  

2. 회원 토큰안에 이메일 정보가 있는데 API 이용시 Email을 매번 입력 받은 것?
Email 정보는 빼서 입력 받아도 동작에 무리가 없을 듯

3. 문서 전체 목록 조회시 승인된 사용자 정보를 보여준 것?
이건 API 이용자들이 편리한 방법대로 수정해야할 사항 같음  
전체 목록 조회시 다 보여주거나 VS 세부 정보 조회시 보여주거나

4. crypt를 사용한 암호화?
crypt의 해싱 암호화는 레인보우 테이블로 입력값을 알 수 있으니 bcrypt의 해싱 + 솔트를 사용하면 보안성이 더 향상 될 듯