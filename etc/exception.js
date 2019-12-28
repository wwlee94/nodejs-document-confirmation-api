var ex = require('../exceptions/exception');

console.log(new ex.InvalidParameterError('InvalidParameterError'));
console.log(new ex.NotFoundTokenError('NotFoundTokenError',401));