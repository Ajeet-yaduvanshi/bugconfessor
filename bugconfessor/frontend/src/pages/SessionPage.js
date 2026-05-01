import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

/* ── Scorecard modal ── */
function ScorecardModal({ sc, onClose }) {
  const rating = sc.debugSkillRating || 0;
  const emoji = rating >= 8 ? '🏆' : rating >= 5 ? '⭐' : '📚';
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.82)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(8px)',
    }}>
      <div onClick={e=>e.stopPropagation()} className="card fade-in"
        style={{ maxWidth:560, width:'100%', padding:32, maxHeight:'90vh', overflowY:'auto' }}>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>{emoji}</div>
          <h2 style={{ fontSize:26, marginBottom:6 }}>Session Complete!</h2>
          <div style={{ fontSize:52, fontWeight:800, color:'var(--accent2)', fontFamily:'var(--display)' }}>
            {rating}<span style={{ fontSize:22, color:'var(--txt3)' }}>/10</span>
          </div>
          <p style={{ color:'var(--txt2)', fontSize:12, marginTop:4 }}>Debug Skill Rating</p>
        </div>

        <p style={{ color:'var(--txt2)', lineHeight:1.7, fontSize:13, textAlign:'center', marginBottom:24 }}>
          {sc.summary}
        </p>

        {[
          { items: sc.strengths,        label:'✓ Strengths',               cls:'bg', bg:'rgba(16,185,129,.08)',  border:'rgba(16,185,129,.2)' },
          { items: sc.conceptsToReview, label:'📚 Concepts to Review',     cls:'by', bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.2)' },
          { items: sc.logicalFallacies, label:'⚠ Logical Fallacies Found', cls:'br', bg:'rgba(239,68,68,.08)',   border:'rgba(239,68,68,.2)' },
        ].map(({ items, label, bg, border }) => items?.length > 0 && (
          <div key={label} style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
              color: label.startsWith('✓') ? 'var(--green)' : label.startsWith('📚') ? 'var(--yellow)' : 'var(--red)',
              marginBottom:10, fontWeight:700 }}>{label}</div>
            {items.map((x,i) => (
              <div key={i} style={{ padding:'8px 12px', background:bg, border:`1px solid ${border}`,
                borderRadius:6, marginBottom:6, fontSize:13 }}>{x}</div>
            ))}
          </div>
        ))}

        <button className="btn btn-primary" onClick={onClose} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ── Main session page ── */
export default function SessionPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [session,      setSession]      = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [code,         setCode]         = useState('');
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [genSC,        setGenSC]        = useState(false);
  const [scorecard,    setScorecard]    = useState(null);
  const [showSC,       setShowSC]       = useState(false);
  const [showEditor,   setShowEditor]   = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { fetchSession(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, sending]);

  const fetchSession = async () => {
    try {
      const r = await axios.get(`/api/sessions/${id}`);
      setSession(r.data.session);
      setMessages(r.data.session.messages || []);
      setCode(r.data.session.codeSnippet || '');
      if (r.data.session.scorecard?.debugSkillRating) setScorecard(r.data.session.scorecard);
    } catch {
      addToast('Session not found', 'error');
      navigate('/history');
    } finally { setLoading(false); }
  };

  const send = useCallback(async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setMessages(p => [...p, { role:'user', content:text, _id: Date.now() }]);
    try {
      const r = await axios.post('/api/ai/chat', { session_id: id, message: text, code_snippet: code });
      setMessages(p => [...p, { role:'assistant', content: r.data.message, _id: Date.now()+1 }]);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send', 'error');
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [input, sending, id, code]);

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const generateScorecard = async () => {
    setGenSC(true);
    try {
      const r = await axios.post('/api/ai/scorecard', { session_id: id });
      setScorecard(r.data.scorecard);
      setShowSC(true);
      setSession(p => ({ ...p, status:'completed' }));
      addToast('Scorecard ready!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to generate scorecard', 'error');
    } finally { setGenSC(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 60px)' }}>
      <div className="spin" style={{ width:32, height:32 }} />
    </div>
  );

  const isDuck = session?.mode === 'rubber_duck';
  const LANG_MAP = { javascript:'javascript', python:'python', java:'java', cpp:'cpp' };

  return (
    <div style={{ height:'calc(100vh - 60px)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header bar */}
      <div style={{ padding:'10px 18px', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'var(--bg2)', flexShrink:0, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <button className="btn btn-ghost" style={{ padding:'4px 8px', fontSize:12 }} onClick={() => navigate('/history')}>
            ← Back
          </button>
          <span style={{ color:'var(--border2)' }}>|</span>
          <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14 }}>
            {session?.title || 'Debugging Session'}
          </span>
          <span className={`badge ${isDuck ? 'by' : 'bp'}`}>{isDuck ? '🦆 Duck' : '🧠 Socratic'}</span>
          <span className="badge bb">{session?.language}</span>
          {session?.status === 'completed' && <span className="badge bg">✓ Done</span>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={() => setShowEditor(p => !p)}>
            {showEditor ? 'Hide Editor' : 'Show Editor'}
          </button>
          {scorecard ? (
            <button className="btn btn-secondary" style={{ fontSize:12 }} onClick={() => setShowSC(true)}>
              View Scorecard
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ fontSize:12 }}
              onClick={generateScorecard} disabled={genSC || messages.length < 2}>
              {genSC ? <><div className="spin" style={{ width:12, height:12 }} /> Analyzing...</> : '📊 Generate Scorecard'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Monaco editor */}
        {showEditor && (
          <div style={{ width:'45%', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
            <div style={{ padding:'7px 14px', borderBottom:'1px solid var(--border)', fontSize:11,
              color:'var(--txt3)', letterSpacing:'.1em', textTransform:'uppercase', background:'var(--bg2)' }}>
              {session?.language} · editor
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <Editor
                height="100%"
                language={LANG_MAP[session?.language] || 'javascript'}
                value={code}
                onChange={v => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize:13,
                  fontFamily:"'Space Mono', monospace",
                  minimap:{ enabled:false },
                  scrollBeyondLastLine:false,
                  padding:{ top:12 },
                  wordWrap:'on',
                  automaticLayout:true,
                  lineNumbers:'on',
                }}
              />
            </div>
          </div>
        )}

        {/* Chat panel */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 8px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--txt3)' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>{isDuck ? '🦆' : '🧠'}</div>
                <p style={{ fontSize:14, marginBottom:6, color:'var(--txt2)' }}>
                  {isDuck ? "Hi! I'm your rubber duck. Tell me what your code does!" : "Hello! Describe your bug and I'll help you think it through."}
                </p>
                <p style={{ fontSize:12 }}>Paste your code in the editor, then start chatting.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={msg._id || i} className="fade-in" style={{
                marginBottom:14, display:'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap:10, alignItems:'flex-start',
              }}>
                <div style={{
                  width:30, height:30, borderRadius:7, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  {msg.role === 'user' ? '👤' : isDuck ? '🦆' : '🧠'}
                </div>
                <div style={{
                  maxWidth:'78%', padding:'10px 14px', fontSize:13, lineHeight:1.65,
                  whiteSpace:'pre-wrap', color:'var(--txt)',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:30, height:30, borderRadius:7, display:'flex', alignItems:'center',
                  justifyContent:'center', background:'var(--bg3)', border:'1px solid var(--border)', fontSize:13 }}>
                  {isDuck ? '🦆' : '🧠'}
                </div>
                <div style={{ padding:'12px 16px', background:'var(--bg3)', border:'1px solid var(--border)',
                  borderRadius:'4px 12px 12px 12px', display:'flex', gap:5, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--txt3)',
                      animation:`pulse 1.2s ease ${i*.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border)',
            background:'var(--bg2)', display:'flex', gap:8, flexShrink:0 }}>
            <textarea
              ref={inputRef}
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              style={{ flex:1, resize:'none', lineHeight:1.5 }}
              placeholder={isDuck
                ? "Tell the duck what your code is supposed to do..."
                : "Describe your bug or answer the coach's question... (Enter to send)"}
            />
            <button className="btn btn-primary" onClick={send}
              disabled={sending || !input.trim()} style={{ alignSelf:'flex-end', padding:'10px 16px' }}>
              {sending ? <div className="spin" style={{ width:14,height:14 }} /> : '↑'}
            </button>
          </div>
        </div>
      </div>

      {showSC && scorecard && <ScorecardModal sc={scorecard} onClose={() => setShowSC(false)} />}
    </div>
  );
}
