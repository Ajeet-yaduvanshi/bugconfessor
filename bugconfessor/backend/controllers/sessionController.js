const Session = require('../models/Session');

const createSession = async (req, res) => {
  try {
    const s = await Session.create({ userId: req.user.id, ...req.body });
    res.status(201).json({ session: s });
  } catch (e) { res.status(500).json({ error: 'Create failed: ' + e.message }); }
};

const getSessions = async (req, res) => {
  const page = +req.query.page || 1, limit = +req.query.limit || 12;
  try {
    const [total, raw] = await Promise.all([
      Session.countDocuments({ userId: req.user.id }),
      Session.find({ userId: req.user.id })
        .select('title language mode status score createdAt updatedAt messages')
        .sort({ updatedAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    ]);
    const sessions = raw.map(s => ({ ...s, messageCount: (s.messages||[]).length, messages: undefined }));
    res.json({ sessions, total, page, limit });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getSession = async (req, res) => {
  try {
    const s = await Session.findOne({ _id: req.params.id, userId: req.user.id });
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ session: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateSession = async (req, res) => {
  try {
    const s = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body }, { new: true }
    );
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ session: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteSession = async (req, res) => {
  try {
    const r = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { createSession, getSessions, getSession, updateSession, deleteSession };
