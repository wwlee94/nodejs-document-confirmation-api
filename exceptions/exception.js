class Base extends Error {
    constructor (message, status) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.status = status 
        this.name = this.constructor.name;
        this.message = message;
    }
};

class Forbidden extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 403;
        this.message = message || '해당 기능에 대한 권한이 없습니다.';
    }
}

class NotFoundTokenError extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 400;
        this.message = message || '로그인 후 발급된 토큰이 필요합니다 !';
    }
};

class NotFoundParameterError extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 400;
        this.message = message || '필요한 요청 파라미터가 없습니다 !';
    }
};

class NotFoundDataError extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 400;
        this.message = message || '검색된 데이터가 없습니다.';
    }
};

class InvalidTokenError extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 401 ;
        this.message = message || '유효한 토큰이 아닙니다 !';
    }
};

class InvalidParameterError extends Base {
    constructor (message, status) { 
        super();
        this.status = status || 422;
        this.message = message || '유효하지 않은 요청 파라미터입니다.';
    }
}

module.exports = {
    Base,
    Forbidden,
    NotFoundTokenError,
    NotFoundParameterError,
    NotFoundDataError,
    InvalidTokenError,
    InvalidParameterError
};