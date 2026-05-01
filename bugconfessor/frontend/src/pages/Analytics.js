import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#7c3aed','#a855f7','#3b82f6','#10b981','#f59e0b','#ef4444'];

const Stat = ({ label, value, sub, color='var(--accent2)' }) => (
  <div className="card" style={{ textAlign:'center' }}>
    <div style={{ fontSize:38, fontFamily:'var(--display)', fontWeight:800, color, marginBottom:4 }}>{value ?? '—'}</div>
    <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:'var(--txt3)' }}>{sub}</div>}
  </div>
);

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 13px', fontSize:12 }}>
      <p style={{ color:'var(--txt2)', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    axios.get('/api/ai/analytics')
      .then(r => setData(r.data))
      .catch(() => addToast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 60px)' }}>
      <div className="spin" style={{ width:32, height:32 }} />
    </div>
  );

  const stats   = data?.stats || {};
  const langs   = data?.languageBreakdown || [];
  const bugs    = data?.bugPatterns || [];
  const scores  = [...(data?.recentScores || [])].reverse();

  const chartScores = scores.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    score: s.debugSkillRating,
  }));

  const fmt = d => new Date(d).toLocaleDateString();

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px' }}>
      <h1 style={{ fontSize:32, marginBottom:6 }}>Analytics</h1>
      <p style={{ color:'var(--txt2)', fontSize:13, marginBottom:36 }}>Your debugging performance over time</p>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:16, marginBottom:32 }}>
        <Stat label="Total Sessions"  value={stats.totalSessions || 0}    sub="all time"                            color="var(--accent2)" />
        <Stat label="Completed"       value={stats.completedSessions || 0} sub={`of ${stats.totalSessions || 0}`}   color="var(--green)" />
        <Stat label="Avg Skill Score" value={stats.avgScore ? `${stats.avgScore}` : '—'} sub="out of 10"            color="var(--yellow)" />
        <Stat label="Languages"       value={stats.languagesUsed || 0}     sub="practiced"                          color="var(--blue)" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns: langs.length ? '2fr 1fr' : '1fr', gap:20, marginBottom:20 }}>

        {/* Skill over time */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20 }}>Debug Skill Over Time</h3>
          {chartScores.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--txt3)', fontSize:13 }}>
              Complete sessions to see your progress chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill:'var(--txt3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,10]} tick={{ fill:'var(--txt3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TTip />} />
                <Line type="monotone" dataKey="score" stroke="var(--accent2)" strokeWidth={2}
                  dot={{ fill:'var(--accent)', r:4 }} activeDot={{ r:6 }} name="Skill Rating" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Language pie */}
        {langs.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize:16, marginBottom:20 }}>Languages Used</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={langs} dataKey="count" nameKey="language" cx="50%" cy="50%" outerRadius={70}
                  label={({ language, percent }) => `${language} ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke:'var(--txt3)' }}>
                  {langs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<TTip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bug patterns bar chart */}
      {bugs.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:16, marginBottom:20 }}>Recurring Weak Spots</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bugs.slice(0,8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill:'var(--txt3)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="description" width={170}
                tick={{ fill:'var(--txt2)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TTip />} />
              <Bar dataKey="frequency" fill="var(--accent)" radius={[0,4,4,0]} name="Times seen" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent sessions table */}
      {data?.recentScores?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20 }}>Recent Completed Sessions</h3>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Title','Language','Skill Rating','Date'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:11,
                    letterSpacing:'.08em', textTransform:'uppercase', color:'var(--txt3)',
                    borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentScores.map((s,i) => (
                <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{s.title || 'Debugging Session'}</td>
                  <td style={{ padding:'10px 12px' }}><span className="badge bp">{s.language}</span></td>
                  <td style={{ padding:'10px 12px', color:'var(--accent2)', fontWeight:700 }}>{s.debugSkillRating}/10</td>
                  <td style={{ padding:'10px 12px', color:'var(--txt3)', fontSize:12 }}>{fmt(s.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!stats.totalSessions && (
        <div className="card" style={{ textAlign:'center', padding:'60px 40px', marginTop:20 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <h3 style={{ fontFamily:'var(--display)', marginBottom:8 }}>No data yet</h3>
          <p style={{ color:'var(--txt2)', fontSize:13 }}>Complete debugging sessions to see analytics here.</p>
        </div>
      )}
    </div>
  );
}
