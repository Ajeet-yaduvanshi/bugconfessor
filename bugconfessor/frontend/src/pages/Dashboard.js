import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LANGS = ['javascript','python','java','cpp'];
const LANG_LABEL = { javascript:'JavaScript', python:'Python', java:'Java', cpp:'C++' };

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', language:'javascript', mode:'socratic', codeSnippet:'' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/sessions', form);
      addToast('Session started!', 'success');
      navigate(`/session/${res.data.session._id}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create session', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px' }}>
      <div style={{ marginBottom:36 }}>
        <h1 style={{ fontSize:34, marginBottom:6 }}>
          Hey, <span style={{ color:'var(--accent2)' }}>{user?.username}</span> 👋
        </h1>
        <p style={{ color:'var(--txt2)' }}>Paste your buggy code. Let's think through it together.</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize:20, marginBottom:24 }}>Start a new debugging session</h2>
        <form onSubmit={submit}>

          {/* Title */}
          <div className="fg">
            <label>Session title (optional)</label>
            <input className="input" placeholder="e.g. Off-by-one in my sort loop"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* Language */}
          <div className="fg">
            <label>Language</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {LANGS.map(l => (
                <button key={l} type="button" onClick={() => set('language', l)} style={{
                  padding:'7px 16px', borderRadius:6, cursor:'pointer', fontSize:12,
                  fontFamily:'var(--mono)', fontWeight: form.language===l ? 700 : 400,
                  border: `1px solid ${form.language===l ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.language===l ? 'rgba(124,58,237,.15)' : 'var(--bg2)',
                  color: form.language===l ? 'var(--accent2)' : 'var(--txt2)',
                  transition:'var(--ease)',
                }}>{LANG_LABEL[l]}</button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="fg">
            <label>Debugging mode</label>
            <div style={{ display:'flex', gap:12 }}>
              {[
                { id:'socratic', icon:'🧠', title:'Socratic Mode', desc:'AI guides you with questions until you find the bug yourself.', color:'var(--accent2)' },
                { id:'rubber_duck', icon:'🦆', title:'Rubber Duck', desc:"AI plays a clueless listener — its naive questions reveal your blind spots.", color:'var(--yellow)' },
              ].map(m => (
                <div key={m.id} onClick={() => set('mode', m.id)} style={{
                  flex:1, padding:16, borderRadius:'var(--rl)', cursor:'pointer',
                  border:`2px solid ${form.mode===m.id ? m.color : 'var(--border)'}`,
                  background: form.mode===m.id ? 'rgba(124,58,237,.07)' : 'var(--bg2)',
                  transition:'var(--ease)',
                }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{m.icon}</div>
                  <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:m.color, marginBottom:4 }}>{m.title}</div>
                  <div style={{ color:'var(--txt2)', fontSize:12, lineHeight:1.5 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Code */}
          <div className="fg">
            <label>Paste buggy code (optional — you can add it in the session)</label>
            <textarea className="input" rows={8} value={form.codeSnippet}
              onChange={e => set('codeSnippet', e.target.value)}
              style={{ resize:'vertical', lineHeight:1.6, fontFamily:'var(--mono)', fontSize:12 }}
              placeholder={`// Paste your ${LANG_LABEL[form.language]} code here...\n`} />
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15 }}
            disabled={loading}>
            {loading
              ? <><div className="spin" style={{ width:16,height:16 }} /> Starting...</>
              : `Start ${form.mode==='rubber_duck' ? '🦆 Rubber Duck' : '🧠 Socratic'} Session →`
            }
          </button>
        </form>
      </div>

      <div style={{ display:'flex', gap:12, marginTop:16 }}>
        {[{href:'/history',label:'📋 Past Sessions'},{href:'/analytics',label:'📊 Analytics'}].map(l => (
          <a key={l.href} href={l.href} style={{ flex:1 }}>
            <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 18px', cursor:'pointer', transition:'var(--ease)' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <span style={{ color:'var(--txt2)', fontSize:13 }}>{l.label}</span>
              <span style={{ color:'var(--txt3)' }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
