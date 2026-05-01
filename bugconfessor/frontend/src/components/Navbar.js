import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/history',   label: 'Sessions'  },
    { to: '/analytics', label: 'Analytics' },
  ];
  return (
    <nav style={{ background:'rgba(7,7,13,.92)', backdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:60,
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🐛</div>
          <span style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:18 }}>
            Bug<span style={{ color:'var(--accent2)' }}>Confessor</span>
          </span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'6px 14px', borderRadius:6, fontSize:13, textDecoration:'none',
              color: loc.pathname === l.to ? 'var(--accent2)' : 'var(--txt2)',
              background: loc.pathname === l.to ? 'rgba(124,58,237,.12)' : 'transparent',
              fontWeight: loc.pathname === l.to ? 700 : 400,
              transition:'var(--ease)',
            }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'var(--txt3)', padding:'4px 10px',
            background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6 }}>
            {user?.username}
          </span>
          <button className="btn btn-ghost" style={{ fontSize:12 }}
            onClick={() => { logout(); nav('/'); }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
