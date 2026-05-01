const Session = require('../models/Session');
const axios = require("axios");

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;


const SOCRATIC = `You are BugConfessor, an AI debugging coach using the strict Socratic method.
RULES — NEVER BREAK:
1. NEVER give the direct bug fix or answer.
2. ALWAYS respond with guiding questions that lead the student to discover the bug themselves.
3. If they are close, ask a more targeted question to nudge them over the line.
4. If stuck, give a one-sentence conceptual hint then ask a question.
5. Celebrate genuine breakthroughs warmly.
6. Max 3 sentences + ONE focused question per reply.
EXAMPLE QUESTIONS: "What do you think this line does exactly?" / "What happens when X is null?" / "Can you trace the code from line N step by step?"
PERSONALITY: Encouraging, patient, slightly quirky — like a brilliant TA who loves the lightbulb moment.`;

const RUBBER_DUCK = `You are a literal rubber duck. You know absolutely nothing about programming.
RULES:
1. Only ask innocent questions a non-programmer would ask.
2. Never use jargon unless the student used it first.
3. Say things like "But what IS a loop though?" or "Why can't it just do it once?"
4. Your naive questions accidentally force deep explanation, revealing bugs.
5. Max 2 sentences + ONE simple curious question per reply.
PERSONALITY: Warm, genuinely curious, a little silly. You love hearing about code despite understanding nothing.`;

// ================= CHAT =================

const chat = async (req, res) => {
  const { session_id, message, code_snippet } = req.body;

  if (!session_id || !message)
    return res.status(400).json({ error: 'session_id and message required' });

  try {
    const session = await Session.findOne({ _id: session_id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (code_snippet !== undefined) session.codeSnippet = code_snippet;

    // Build history
    const history = session.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const code = code_snippet ?? session.codeSnippet;

    const userMsg = code
      ? `[Language: ${session.language}]\n\`\`\`\n${code}\n\`\`\`\n${message}`
      : message;

    session.messages.push({ role: 'user', content: message });

    const systemPrompt =
      session.mode === 'rubber_duck' ? RUBBER_DUCK : SOCRATIC;

    // REST API CALL
    let response;

    for (let i = 0; i < 3; i++) {
      try {
        response = await axios.post(
          `${API_URL}?key=${API_KEY}`,
          {
            contents: [
              ...history,
              {
                role: "user",
                parts: [{ text: systemPrompt + "\n\n" + userMsg }]
              }
            ]
          }
        );
        break; // success → exit loop
      } catch (err) {
        const code = err.response?.data?.error?.code;

        if (code === 503 && i < 2) {
          console.log("⚠️ Gemini busy... retrying");
          await new Promise(res => setTimeout(res, 2000)); // wait 2 sec
        } else {
          throw err;
        }
      }
    }

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    session.messages.push({ role: 'assistant', content: aiText });

    await session.save();

    res.json({ message: aiText, session_id, mode: session.mode });

  } catch (e) {
    console.error("Chat error:", e.response?.data || e.message);
    res.status(500).json({ error: 'AI error: ' + e.message });
  }
};

// ================= SCORECARD =================

const generateScorecard = async (req, res) => {
  const { session_id } = req.body;

  try {
    const session = await Session.findOne({ _id: session_id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const transcript = session.messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
Analyze debugging session and return ONLY JSON:
{"debugSkillRating":1-10,"summary":"...","logicalFallacies":[],"conceptsToReview":[],"strengths":[]}

Conversation:
${transcript}
`;

    let response;

    for (let i = 0; i < 3; i++) {
      try {
        response = await axios.post(
          `${API_URL}?key=${API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          }
        );
        break;
      } catch (err) {
        const code = err.response?.data?.error?.code;

        if (code === 503 && i < 2) {
          console.log("⚠️ Retrying scorecard...");
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw err;
        }
      }
    }

    let scorecard;

    try {
      scorecard = JSON.parse(
        response.data.candidates[0].content.parts[0].text
      );
    } catch {
      scorecard = {
        debugSkillRating: 5,
        summary: "Session completed",
        logicalFallacies: [],
        conceptsToReview: [],
        strengths: []
      };
    }

    session.scorecard = scorecard;
    session.score = scorecard.debugSkillRating * 10;
    session.status = 'completed';

    await session.save();

    res.json({ scorecard });

  } catch (e) {
    console.error("Scorecard error:", e.response?.data || e.message);
    res.status(500).json({ error: 'Scorecard failed' });
  }
};

// ================= ANALYTICS =================

const getAnalytics = async (req, res) => {
  try {
    const all = await Session.find({ userId: req.user.id }).lean();

    const completed = all.filter(s => s.status === 'completed');

    res.json({
      totalSessions: all.length,
      completedSessions: completed.length
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { chat, generateScorecard, getAnalytics };
