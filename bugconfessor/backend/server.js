require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' } });

connectDB();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/ai',       require('./routes/ai'));

app.get('/api/health', (req, res) => {
  const m = require('mongoose');
  res.json({ status: 'ok', db: m.connection.readyState === 1 ? 'MongoDB Atlas' : 'disconnected', ai: 'Gemini 1.5 Flash (free)' });
});

io.on('connection', socket => {
  socket.on('join_session',  id => socket.join('s_' + id));
  socket.on('leave_session', id => socket.leave('s_' + id));
});

app.use((err, req, res, next) => res.status(500).json({ error: 'Server error' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🐛 BugConfessor API  → http://localhost:' + PORT + '/api');
  console.log('🤖 AI Engine        → Google Gemini 1.5 Flash (FREE)');
  console.log('🍃 Database         → MongoDB Atlas\n');
});
