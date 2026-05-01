const r = require('express').Router();
const auth = require('../middleware/auth');
const { chat, generateScorecard, getAnalytics } = require('../controllers/aiController');
r.use(auth);
r.post('/chat', chat); r.post('/scorecard', generateScorecard); r.get('/analytics', getAnalytics);
module.exports = r;
