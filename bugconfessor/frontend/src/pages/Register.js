import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { addToast('Password min 6 chars','error'); return; }
    setLoading(true);
    try { await register(form.username, form.email, form.password); addToast('Account created!','success'); nav('/dashboard'); }
    catch (err) { addToast(err.response?.data?.error || 'Registration failed','error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      background:'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.08) 0%, transparent 60%)' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <h1 style={{ fontSize:32, marginBottom:6 }}>Create account</h1>
          <p style={{ color:'var(--txt2)', fontSize:14 }}>Start your debugging journey</p>
        </div>
        <div className="card" style={{ padding:32 }}>
          <form onSubmit={submit}>
            <div className="fg"><label>Username</label>
              <input className="input" placeholder="debugmaster99" required minLength={3}
                value={form.username} onChange={e => setForm(p=>({...p,username:e.target.value}))} /></div>
            <div className="fg"><label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></div>
            <div className="fg"><label>Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" required minLength={6}
                value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} /></div>
            <button type="submit" className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:12, marginTop:4 }} disabled={loading}>
              {loading ? <><div className="spin" style={{width:16,height:16}}/> Creating...</> : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, color:'var(--txt2)', fontSize:13 }}>
            Have an account? <Link to="/login" style={{ color:'var(--accent2)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
