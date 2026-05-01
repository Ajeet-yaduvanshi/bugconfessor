const r = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/sessionController');
r.use(auth);
r.post('/', c.createSession); r.get('/', c.getSessions);
r.get('/:id', c.getSession); r.put('/:id', c.updateSession); r.delete('/:id', c.deleteSession);
module.exports = r;
