### Header 옵션
보안상의 이유로 서버는 기본적으로 같은 서버가 아닌 다른 곳에서 오는 요청들을 기본적으로 차단합니다.  
또한 클라이언트에서 오는 요청도 다른곳으로 간주합니다.  
하지만 API는 클라이언트를 위한 프로그램이므로 같은 서버가 아닌 다른 곳에서 오는 요청들을 허가해야 하는데, 이것을 HTTP 접근 제어 혹은 CORS(Cross-origin resource sharing, 출처가 다른 곳끼리 자원 공유)라고 합니다.

1. Access-Control-Allow-Origin: 요청이 허용되는 url을 route을 제외하고 적습니다. 이외의 url로 부터 오는 요청은 거절됩니다. 단 *은 모든 요청을 허가시킵니다.
2. Access-Control-Allow-Methods:요청이 허용되는 HTTP verb 목록을 적습니다. 여기에 포함되지 않은 HTTP verb의 요청은 거절됩니다. *을 사용할 수 없습니다.
3. Access-Control-Allow-Headers: 요청이 허용되는 HTTP header 목록을 적습니다. 여기에 포함되지 않은 HTTP header는 사용할 수 없습니다.  *을 사용할 수 없습니다.

## 자바스크립트 유틸 라이브러리
### Lodash
ES6를 사용하면 map, find, filter 등의 array functions가 제공되기 때문에 Lodash의 쓰임이 많이 줄었지만 여전히 array나 object를 전처리, 파싱할 때 좋은 라이브러리

### body-parser
post로 요청된 body를 쉽게 추출할 수 있는 모듈

`app.use(bodyParser.urlencoded({extended: true}));`  
객체 안에 객체를 파싱할 수 있게하려면 extended: true  

## NodeJS 프레임워크
### Express.js
Express.js는 Node.js의 핵심 모듈인 http와 Connect 컴포넌트를 기반으로 하는 웹 프레임워크임  
그러한 컴포넌트를 미들웨어(middleware)라고 하며, 설정보다는 관례 (convention over configuration)와 같은 프레임워크의 철학을 지탱하는 주춧돌에 해당함  
즉, 개발자들은 특정 프로젝트에 필요한 라이브러리를 어떤 것이든 자유롭게 선택할 수 있으며, 이는 개발자들에게 유연함과 수준 높은 맞춤식 구성을 보장함  

#### 이 외 사용안한 다른 프레임워크: Koa

## 토큰 생성 모듈
### Jsonwebtoken: JWT
많은 웹 서비스들은 사용자 인증을 구현하기 위해서 쿠키와 세션을 이용함  
그런데 쿠키와 세션에는 여러 문제들이 있어서, 최근에는 OAuth와 JWT 같은 토큰 기반의 인증 방식이 주로 사용됨  
JWT는 사용자 정보를 JSON 객체에 담아 이를 암호화하고 해싱 작업을 거쳐 문자열 토큰을 생성하는 기술  
JWT는 서버에 저장되지 않기 때문에 서버 부하를 일으키지 않으며, 해싱을 통해 데이터의 무결성을 보장하는 인증 방식

## 해시 암호화 모듈
### Crypto, Bcrypt
#### Crypto
단방향 암호화의 가장 간단한 방식인 해시 함수를 지원하는 암호화 모듈
1. Hmac-sha256 메소드 사용
```
// hash 함수 중 Hash와 Hmac이 존재
// createHash
const hash = crypto.createHash('sha256');

// createHmac이용
const crypto = require('crypto');

const secret = 'abcdefg';
const hash = crypto.createHmac('sha256', secret)
                   .update('I love cupcakes')	// 암호화할 값
                   .digest('hex');	// 인코딩방식
console.log(hash);
// Prints:
// 0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```
Hash함수와 Hmac함수의 차이는 키 값의 유무

2. pbkdf2 메소드 사용
```
// pbkdf2 메소드는 입력값(secret), salt, 해시함수 반복횟수, 해시 알고리즘
// 5개 인자를 받는다.
const crypto = require('crypto');
crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err, 
  derivedKey) => {
    if (err) {
      throw err;
    }
    console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
});
```
-Salt 사용-  
해시 알고리즘을 이용해서 변환시킨 해시값은 항상 고정된 길이의 값으로 나타나기 때문에 한계를 가지고 있다.  
(중복이 적게 나타날 수록 좋은 해시함수) 단순히 해시 함수를 이용해서 변환한다고 해서 완벽하지 않다.  
이 점을 보완하기 위해 비밀번호에 Salt라는 특정 값을 넣는 방법이 있고, 해시 함수를 여러번 돌리는 방법이 있다.  
Node.js에 crypto라는 내장 모듈이 존재, crypto 모듈의 pbkdf2 메서드는 단방향 암호화에서 많이 사용.

#### Bcrypt
bcrypt는 애초부터 패스워드 저장을 목적으로 설계되었다. Niels Provos와 David Mazières가 1999년 발표했고 현재까지 사용되는 가장 강력한 해시 메커니즘 중 하나이다.   
bcrypt는 보안에 집착하기로 유명한 OpenBSD에서 기본 암호 인증 메커니즘으로 사용되고 있고 미래에 PBKDF2보다 더 경쟁력이 있다고 여겨진다.

## 환경 변수 관리하는 모듈
### Dotenv
.env 파일로 환경 변수를 한 곳에서 관리하도록 도와주는 모듈

## DB Access 모듈
### Mongoose
Mongoose 는 Node.js 환경에서 MongoDB 에 접근하여 데이터베이스를 조회 및 수정, 삭제 등을 가능하게 해 주는 모듈

## Spec test 도듈
### Mocha, Chai, Supertest
#### Mocha
살펴볼 Mocha(모카)는 테스트 러너를 지원하는 테스트 프레임워크 입니다.  
자체 Assertion(어써션)은 지원하지 않으며, 필요한 Assertion 라이브러리를 가져와 사용할 수 있습니다.  

#### Chai
mochjs.org에서 리스팅 된 Assertion에는 Should.js, expect.js, Chai, better-assert, unexpected 가 있음  
이 중 어떤 Assertion를 사용하는지는 사용자의 판단에 있다.   
궁극적으로는 같은 목적을 가지기 때문에 어떤 스타일을 선호하냐는 것에 따라 나뉠 수 있다.  
대게 Mocha는 Chai와 같이 사용되며, NPM compare를 참고로 보았을 때도 Chai가 다른 Assertion 보다 선호하는 것을 볼 수 있음

먼저 Chai는 Node.js 기반의 Assertion library로 BDD와 TDD 스타일을 지원하고 있음  

#### Supertest
mocha가 하나의 함수를 테스트했다면, 통합테스트(api 기능 테스트)에서 사용하는 라이브러리  
api 서버라면 내부적으로 express 구동 -> 요청보낸 뒤 결과 검증까지함(시나리오 코드 작성)

#### 이 외 사용안한 다른 테스트 모듈 Sinon, Nock 등   
서비스 내에서 처리하는 로직은 테스트 하기가 쉬움, 모든 환경을 내가 제어할 수 있기 때문 -> But 만약 외부 API 사용하는 경우엔 테스트하기가 좀 까다로움 ! -> Mocking 테스트 도구 나옴
* 이유  
1. 외부 API가 수시로 변경되는 경우가 발생할 수 있다.
2. 전체 테스트 속도가 느려진다.

### Sinon, Nock
Nock, Sinon은 HTTP Mocking 라이브러리  

외부 HTTP 요청을 보내는 코드가 있음 -> 테스트마다 상황이 약간씩 다르니 일부 테스트에서 이 외부 HTTP 요청을 모킹해서 HTTP 요청이 실제 해당 서버로 날아가는 것이 아니라 모킹한 서버에서 미리 정해놓은 응답을 받아서 테스트하는 것 -> 보통 외부 HTTP 요청에 응답 값을 테스트하는 게 아니라 테스트한 결과에 대한 로직을 테스트하려는 의도

#### Sinon vs Nock
* Sinon은 자바스크립트용 라이브러리라서 HTTP MOCK 외에도 다양한 기능을 제공하는 라이브러리  
보통 원하는 것 이상의 것을 제공하기 때문에 적합하지는 않을 수 있음  
* NodeJS에서 사용하는 것 중 Nock을 발견 -> 이것은 HTTP 요청에 대해 Mock 데이터를 정의하는 용도


## 추가적으로 고민 해봐야 할 것들
1. Error 처리는 Throw로 처리해야 좋은가?  
현재는 Thorw와 미들웨어로 메시지를 보내는 에러 처리 2가지가 사용됨  
한가지로 일관성있게 해야 좋은가? VS 상황에 맞춰 사용해야하나?

2. 회원 토큰안에 이메일 정보가 있는데 API 이용시 Email을 매번 입력 받은 것?  
Email 정보는 빼서 입력 받아도 토큰에 이메일 정보가 있기 때문에 서비스 동작에 무리 없고 더 편리하게 이용 가능할 듯

3. 문서 전체 목록 조회시 승인된 사용자 정보를 보여준 것?  
이건 API 이용자들이 편리한 방법대로 수정해야할 사항 같음  
전체 목록 조회시 다 보여주거나 VS 세부 정보 조회시 보여주거나

4. 해싱 기능만 사용한 암호화?  
crypt의 해싱 암호화는 레인보우 테이블로 입력값을 알 수 있으니 bcrypt의 해싱 + 솔트를 사용하면 보안성이 더 향상 될 듯