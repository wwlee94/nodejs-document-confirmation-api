const crypto = require('crypto');	

const password = 'abc123';	

const hashed = crypto.createHmac('sha256', 'MySuperSecretKey!@#$').update(password).digest('hex');	

console.log(hashed); 