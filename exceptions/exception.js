module.exports = class Exception extends Error {
  constructor (message, status) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = status 
    this.name = this.constructor.name;
    this.message = message;
  }
};