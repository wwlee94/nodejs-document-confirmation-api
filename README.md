# 문서 컨펌 REST API
## Document Confirmation REST API

### 제공되는 기능
* 유저 토큰 시스템 (User, Auth)
    * 회원가입, 로그인 기능으로 Token을 발급 받은 유저만 문서 결재 API를 이용할 수 있습니다.
* 문서 조회 기능 (Document)
    * 검색 필터(INBOX, OUTBOX, ARCHIVE)에 따라 자신이 관여한 문서 목록을 조회 할 수 있습니다.
    * 상세정보와 어떤 유저가 이 문서를 승인하고 취소했는지에 대한 내역을 조회할 수 있습니다. 
* 문서 결재 요청 기능 (Document)
    * 결재를 원하는 문서를 생성할 수 있습니다.
    * 결재자는 한명 이상이 되어야하고 문서를 생성한 본인을 지정할 수도 있습니다.
* 문서 컨펌 기능 (Confirmation)
    * 문서를 승인하거나 거절 할 수 있습니다.
    * 결재는 순서대로 진행되고 두번째 결재자가 먼저 결재할 수는 없습니다.
    * 모든 결재자가 승인하면 문서가 승인됩니다. 한명이라도 거절하면 거절됩니다.
    * 문서 승인/거절시 의견을 추가할 수 있습니다.

### 사용한 모듈 스택 및 개념 정리
* [모듈 스택 및 개념](https://github.com/wwlee94/nodejs-document-confirmation-api/blob/master/nodejs_study.md)

## 문서 전자 결재 API 서버 실행하기

### 1. Git repository를 로컬 저장소에 클론합니다.
```
git clone https://github.com/wwlee94/nodejs-document-confirmation-api.git
```

### 2. Clone된 폴더로 이동합니다.
```
cd nodejs-document-confirmation-api
```

### 3. 의존성 패키지들을 다운로드 받습니다.
```
npm install
```

### 4. 서버를 실행시키면 끝 !
```
node server.js
```

### 5. 테스트를 진행하려면? (spec 폴더, scenario.spec.js)
원하는 spec 파일을 아래의 명령어로 실행 시키면 됩니다.  
```
npm test {path/to/spec} 
```
```
ex) 시나리오 스펙 테스트: 전체적인 동작 과정을 스크립트로 구현한 파일로 이 파일은 각 테스트가 독립적이지 않습니다.
npm test scenario.spec.js
```

# API REFERENCE

## Auth API
이메일과 패스워드로 로그인 시 유저 별로 토큰을 발급해주는 로그인 기능을 제공합니다.
```
POST /api/auth/login -> 로그인 기능
```

#### Request Header 구조
```
POST /api/auth/login
Content-Type: application/json
```

#### Request Body 요청 예시
```
{
  "email": "wwlee94@naver.com",
  "password": "password"
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| email          | String | 유저 이메일 |
| password       | String | 유저 비밀번호 |

#### Response Body 예시
```
{
  "status": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Users API
유저 정보 조회, 회원가입, 회원탈퇴 기능을 제공합니다.

```
GET /api/users -> 유저 정보 조회 기능

POST /api/users -> 회원 가입 기능

DELETE /api/users -> 회원 탈퇴 기능
```

### Users API - 회원 가입 기능

#### Request Header 구조
```
POST /api/users
Content-Type: application/json
```

#### Request Body 요청 예시
```
{
  "email": "rlawlsud1234@naver.com",
  "password": "password",
  "passwordConfirm": "password"
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| email          | String | 유저 이메일 |
| password       | String | 유저 비밀번호 |
| passwordConfirm  | String | 비밀번호 재확인 |

#### Response Body 예시
```
{
  "status": 200,
  "data": "rlawlsud1234@naver.com 계정을 생성했습니다 !"
}
```

## Documents API
* Type에 따라 자신이 관여한 문서 목록을 조회 할 수 있습니다.
    * OUTBOX: 내가 생성한 문서 중 결재 진행 중인 문서
    * INBOX: 내가 결재를 해야 할 문서
    * ARCHIVE: 내가 관여한 문서 중 결재가 완료(승인 또는 거절)된 문서 -> 문서를 생성해서 완료되었거나 결재한 문서가 
* 상세정보와 어떤 유저가 이 문서를 승인하고 취소했는지에 대한 내역을 조회할 수 있습니다. 
```
POST /api/documents

GET /api/documents

GET /api/documents/:id
```
### 1. Documents API - 문서 결재 요청

#### Request Header 구조
```
POST /api/documents
x-access-token: {x-access-token} -> 로그인시 발급 받은 토큰 
Content-Type: application/json
```

#### Request Body 요청 예시
```
{
    "email" : "wwlee94@naver.com",
    "title": "두번째 문서 입니다.",
    "content": "내용은 다음과 같습니다!",
    "order" : "wwlee94@naver.com, wjdtjddus1109@naver.com"
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| email          | String | 문서  요청한 유저 이메일 |
| title       | String | 문서 제목 |
| content  | String | 문서 내용 |
| order  | String | 문서를 컨펌할 유저 순서 |

#### Response Body 예시
```
{
    "status": 200,
    "data": "['두번째 문서 입니다.'] 결재 문서를 생성했습니다 !"
}
```

### 2. Documents API - 문서 목록 조회

#### Request Header 구조
```
GET /api/documents
x-access-token: {x-access-token} -> 로그인시 발급 받은 토큰 
Content-Type: application/json
```

#### Query Parameter (type: 선택사항)
| Parameter | Type   | Description |
|----------------|--------|-------------|
| email           | String | 유저 이메일 |
| type           | String | 문서의 타입 [OUTBOX, INBOX, ARCHIVE]|

#### Response Body 예시
```
{
    "status": 200,
    "data": [
        {
            "_id": "5e096a3aed6ce3d2b507f8d9",
            "userEmail": "wwlee94@naver.com",
            "title": "첫번째 문서 입니다."
            "type": "APPROVED",
            "confirmationOrder": [
                "wjdtjddus1109@naver.com",
                "wwlee94@naver.com"
            ],
            "confirmedUsers": [
                "5e096a9ded6ce3d2b507f8da",
                "5e097067fbda8ed5b11dbffb"
            ]
        }
    ]
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| _id          | ObjectId | 문서의 ID |
| userEmail       | String | 문서 결재를 요청한 유저 이메일 |
| title  | String | 문서의 제목 |
| type  | String | 문서의 결재 상태 (RUNNING, APPROVED, CANCELED) |
| confirmationOrder  | String | 문서를 컨펌할 유저 순서 |
| confirmedUsers  | [ObjectId] | 문서 결재 내역을 담은 Confirmation 모델의 Ref ID|
* Confirmation 모델 -> 문서를 컨펌 한 유저 이메일, 의견(코멘트) 정보가 담겨있습니다.

### 3. Documents API - 문서 세부 정보 조회

#### Request Header 구조
```
GET /api/documents/:id
x-access-token: {x-access-token} -> 로그인시 발급 받은 토큰 
Content-Type: application/json
```

#### Path Parameter
| Parameter | Type   | Description |
|----------------|--------|-------------|
| id           | String | 문서의 ID |

#### Response Body 예시
```
{
    "status": 200,
    "data": {
        "_id": "5e096a3aed6ce3d2b507f8d9",
        "userEmail": "wwlee94@naver.com",
        "title": "첫번째 문서 입니다.",
        "content": "내용은 다음과 같습니다!",
        "type": "APPROVED",
        "confirmationOrder": [
            "wjdtjddus1109@naver.com",
            "wwlee94@naver.com"
        ],
        "confirmedUsers": [
            {
                "_id": "5e096a9ded6ce3d2b507f8da",
                "userEmail": "wjdtjddus1109@naver.com",
                "comment": "수고하셨습니다.",
                "confirmation": "APPROVED"
            }
        ]
        "createdAt": "2019-12-30T03:08:42.214Z",
        "updatedAt": "2019-12-30T03:35:03.330Z"
    }
}
```
위에서 중복된 Parameter의 설명은 생략합니다.

| Parameter | Type   | Description |
|----------------|--------|-------------|
| content  | String | 문서의 제목 |
| confirmedUsers  | [Dictionary] | 문서 결재 내역을 담은 Confirmation 모델의 세부 정보|
| userEmail  | String | 문서를 컨펌한 유저 이메일 |
| comment  | String | 문서 컨펌시 남긴 의견(코멘트) |
| confirmation  | String | 문서 컨펌 결과 (APPROVED, CANCELED) |

## Confirmations API
* 문서를 승인하거나 거절 할 수 있습니다.
* 결재는 순서대로 진행되고 두번째 결재자가 먼저 결재할 수는 없습니다.
* 모든 결재자가 승인하면 문서가 승인됩니다. 한명이라도 거절하면 거절됩니다.
* 문서 승인/거절시 의견을 추가할 수 있습니다.
```
POST /api/confirmations

GET /api/confirmations
```
### 1. Confirmations API - 문서 컨펌 내역 생성

#### Request Header 구조
```
POST /api/confirmations
x-access-token: {x-access-token} -> 로그인시 발급 받은 토큰 
Content-Type: application/json
```

#### Request Body 요청 예시
```
{
    "id": "5e097136fbc5afd6d071e3b3",
    "email": "wwlee94@naver.com",
    "comment": "결재를 취소합니다!",
    "confirmation" : "CANCELED"
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| id          | String | 컨펌할 문서의 ID |
| email       | String | 컨펌하는 유저 이메일|
| comment  | String | 문서 컨펌시 남긴 의견(코멘트) |
| confirmation  | String | 문서 컨펌 결과 (APPROVED, CANCELED) |

#### Response Body 예시
```
{
    "status": 200,
    "data": "'wwlee94@naver.com'님이 ['두번째 문서 입니다.'] 문서를 취소했습니다."
}
```

### 2. Confirmations API - 문서 컨펌 내역 조회

#### Request Header 구조
```
GET /api/confirmations
x-access-token: {x-access-token} -> 로그인시 발급 받은 토큰 
Content-Type: application/json
```

#### Query Parameter
| Parameter | Type   | Description |
|----------------|--------|-------------|
| email           | String | 컨펌 내역을 조회할 유저 이메일 |

#### Response Body 예시
```
{
    "status": 200,
    "data": [
        {
            "_id": "5e097067fbda8ed5b11dbffb",
            "comment": "수고하셨습니다. !! 고생하셨어요!",
            "confirmation": "APPROVED",
            "document": {
                "type": "APPROVED",
                "_id": "5e096a3aed6ce3d2b507f8d9",
                "title": "첫번째 문서 입니다."
            }
            "createdAt": "2019-12-30T03:35:03.119Z"
        }
    ]
}
```
| Parameter | Type   | Description |
|----------------|--------|-------------|
| _id  | ObjectId | 컨펌 ID |
| comment  | String | 문서 컨펌시 남긴 의견(코멘트) |
| confirmation  | String | 문서 컨펌 결과 (APPROVED, CANCELED) |
| document  | Dictionary | 컨펌한 문서의 정보 |
| type  | String | 컨펌한 문서의 상태 |
| title  | String | 컨펌한 문서의 제목 |

#### Response Status Code
| Status Code               | Description                                       |
|---------------------------|---------------------------------------------------|
| 200 OK                    | 성공                                              |
| 400 Bad Request           | 클라이언트 요청 오류 - 필요한 요청 파라미터나 토큰이 없을 때, 검색된 데이터가 없을 때 |
| 401 Unauthorized           | 유효한 토큰이 아닐 때 |
| 403 Forbidden             | 해당 기능에 대한 권한이 없을 때 |
| 422 Unprocessable Entity  | 유효하지 않은 요청일 경우 |
| 500 Internal Server Error | 서버에 문제가 있을 경우 |


## Version
NVM - 0.30.2  
NPM - 6.7.0  
NodeJS - v11.11.0

## 문의 사항
Email : wwlee9410@gmail.com 으로 연락주세요.
