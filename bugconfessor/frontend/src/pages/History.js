import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const LBADGE = { javascript:'by', python:'bb', java:'br', cpp:'bp' };

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const limit = 12;

  useEffect(() => { fetch(); }, [page]);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`/api/sessions?page=${page}&limit=${limit}`);
      setSessions(r.data.sessions);
      setTotal(r.data.total);
    } catch { addToast('Failed to load sessions', 'error'); }
    finally { setLoading(false); }
  };

  const del = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session?')) return;
    try {
      await axios.delete(`/api/sessions/${id}`);
      addToast('Deleted', 'success');
      fetch();
    } catch { addToast('Failed to delete', 'error'); }
  };

  const fmt = d => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:32, marginBottom:4 }}>Session History</h1>
          <p style={{ color:'var(--txt2)', fontSize:13 }}>{total} total sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>+ New Session</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div className="spin" style={{ width:32, height:32, margin:'0 auto' }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px 40px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🐛</div>
          <h3 style={{ fontFamily:'var(--display)', marginBottom:8 }}>No sessions yet</h3>
          <p style={{ color:'var(--txt2)', marginBottom:24, fontSize:13 }}>Start your first debugging session.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Start Now</button>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:16 }}>
            {sessions.map(s => (
              <div key={s._id} className="card" onClick={() => navigate(`/session/${s._id}`)}
                style={{ cursor:'pointer', transition:'var(--ease)', position:'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>

                <button className="btn btn-ghost" onClick={e => del(e, s._id)}
                  style={{ position:'absolute', top:10, right:10, padding:'3px 7px', fontSize:11 }}>✕</button>

                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                  <span className={`badge ${LBADGE[s.language] || 'bp'}`}>{s.language}</span>
                  <span className={`badge ${s.mode==='rubber_duck' ? 'by' : 'bp'}`}>
                    {s.mode==='rubber_duck' ? '🦆' : '🧠'}
                  </span>
                  {s.status === 'completed' && <span className="badge bg">✓</span>}
                </div>

                <h3 style={{ fontFamily:'var(--display)', fontSize:14, fontWeight:700,
                  lineHeight:1.4, paddingRight:24, marginBottom:12 }}>
                  {s.title || 'Debugging Session'}
                </h3>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--txt3)', fontSize:11 }}>{fmt(s.createdAt)}</span>
                  <span style={{ color:'var(--txt3)', fontSize:11 }}>{s.messageCount || 0} msgs</span>
                  {s.score > 0 && (
                    <span style={{ color:'var(--accent2)', fontSize:12, fontWeight:700 }}>
                      {Math.round(s.score/10)}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > limit && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:32, alignItems:'center' }}>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</button>
              <span style={{ color:'var(--txt2)', fontSize:13 }}>Page {page} of {Math.ceil(total/limit)}</span>
              <button className="btn btn-secondary" onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/limit)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
