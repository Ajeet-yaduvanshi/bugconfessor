const r = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
r.post('/register', register); r.post('/login', login); r.get('/me', auth, getMe);
module.exports = r;
