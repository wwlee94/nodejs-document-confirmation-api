const crypto = require('crypto');
require('dotenv').config();

const password = 'abc123';

const hashed = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');

console.log(hashed);