const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sign = (u) => jwt.sign({ id: u._id, username: u.username, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password min 6 characters' });
  try {
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ error: 'Email or username already taken' });
    const user = await new User({ username, email, passwordHash: password }).save();
    res.status(201).json({ token: sign(user), user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ error: 'Registration failed: ' + e.message }); }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user), user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ error: 'Login failed: ' + e.message }); }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
};

module.exports = { register, login, getMe };
