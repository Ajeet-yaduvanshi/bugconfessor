# 🐛 BugConfessor — AI Debugging Coach

> Stop copy-pasting Stack Overflow fixes. Start **thinking** like a debugger.

Built with: **React** · **Node.js/Express** · **MongoDB Atlas** (free) · **Google Gemini AI** (free)

---

## ✨ Features
- 🧠 **Socratic Mode** — AI never gives you the answer, only guiding questions
- 🦆 **Rubber Duck Mode** — AI plays a clueless listener; its naivety exposes your bugs
- 📝 **Monaco Editor** — In-browser code editor with full syntax highlighting
- 📊 **Session Scorecards** — Skill rating 1–10, fallacy detection, concepts to review
- 📈 **Analytics Dashboard** — Bug patterns, language breakdown, skill trend chart
- 🔐 **JWT Authentication** — Secure login/register

---

## 🚀 Setup (5 Steps)

### Prerequisites
| Tool | Version | Get it |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | included with Node |
| MongoDB Atlas | free tier | https://cloud.mongodb.com |
| Gemini API Key | free | https://aistudio.google.com/app/apikey |

---

### Step 1 — Get a FREE Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click **Create API Key**
4. Copy the key

### Step 2 — Create a FREE MongoDB Atlas Cluster
1. Go to https://cloud.mongodb.com and create a free account
2. Create a **free M0 cluster** (takes ~2 minutes)
3. Under **Database Access** → Add a database user with a password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, for local dev)
5. Under **Databases** → Connect → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
   - Add `bugconfessor` as the database name at the end

### Step 3 — Configure Environment
```bash
cd backend
cp .env
```
Edit `backend/.env`:
```
GEMINI_API_KEY=AIza...your_key_here
JWT_SECRET=pick_any_long_random_string_here
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/bugconfessor?retryWrites=true&w=majority
```

### Step 4 — Install Dependencies
```bash
# In the root bugconfessor/ folder:
npm install

cd backend
npm install
cd ..

cd frontend
npm install
cd ..
```

### Step 5 — Start the App
```bash
# From root folder — starts both backend + frontend:
npm start
```
Or start separately:
```bash
# Terminal 1
cd backend && npm run dev
# → Running at http://localhost:5000

# Terminal 2
cd frontend && npm start
# → Running at http://localhost:3000
```

Open **http://localhost:3000** in your browser. 🎉

---

## 📁 Project Structure

```
bugconfessor/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js                # Mongoose User schema
│   │   └── Session.js             # Mongoose Session + messages schema
│   ├── middleware/
│   │   └── auth.js                # JWT verification
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── sessionController.js   # CRUD for sessions
│   │   └── aiController.js        # Gemini chat, scorecard, analytics
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   └── ai.js
│   ├── server.js                  # Express + Socket.io entry point
│   └── .env.example
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── context/
│       │   ├── AuthContext.js     # Global auth state + axios setup
│       │   └── ToastContext.js    # Toast notifications
│       ├── components/
│       │   └── Navbar.js
│       ├── pages/
│       │   ├── Landing.js         # Public marketing page
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js       # Create new session
│       │   ├── SessionPage.js     # Monaco editor + AI chat
│       │   ├── History.js         # Past sessions grid
│       │   └── Analytics.js       # Charts + stats (Recharts)
│       ├── App.js                 # Router + providers
│       ├── index.js
│       └── index.css              # Design system (CSS vars + utilities)
│
├── package.json                   # Root: concurrently scripts
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No  | Create account |
| POST | `/api/auth/login`    | No  | Login |
| GET  | `/api/auth/me`       | Yes | Current user |
| POST | `/api/sessions`      | Yes | Create session |
| GET  | `/api/sessions`      | Yes | List sessions |
| GET  | `/api/sessions/:id`  | Yes | Get session + messages |
| PUT  | `/api/sessions/:id`  | Yes | Update session |
| DELETE| `/api/sessions/:id` | Yes | Delete session |
| POST | `/api/ai/chat`       | Yes | Send message, get Gemini response |
| POST | `/api/ai/scorecard`  | Yes | Generate session scorecard |
| GET  | `/api/ai/analytics`  | Yes | Get user analytics |

---

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Check your Atlas connection string has the right username/password
- Ensure `0.0.0.0/0` is in Network Access (or your specific IP)
- Make sure the database name `bugconfessor` is in the URI

**Gemini API error:**
- Verify your API key at https://aistudio.google.com/app/apikey
- The free tier has generous limits (60 requests/minute on Gemini 1.5 Flash)

**Frontend can't reach backend:**
- The `"proxy": "http://localhost:5000"` in `frontend/package.json` handles this
- Make sure the backend is running first

**Port conflicts:**
- Backend port: change `PORT` in `backend/.env`
- Frontend port: run `PORT=3001 npm start` in the frontend folder
