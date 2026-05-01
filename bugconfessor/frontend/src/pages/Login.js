import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // ✅ fixed

  const { login } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      addToast('Welcome back!', 'success');
      nav('/dashboard');
    } catch (err) {
      setError("Invalid email or password"); // ✅ inline error

      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Wrong email or password";

      addToast(message, "error"); // optional toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.08) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--txt2)', fontSize: 14 }}>
            Sign in to continue debugging
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={submit}>

            {/* EMAIL */}
            <div className="fg">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={e => {
                  setForm(p => ({ ...p, email: e.target.value }));
                  setError('');
                }}
              />
            </div>

            {/* PASSWORD */}
            <div className="fg">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => {
                  setForm(p => ({ ...p, password: e.target.value }));
                  setError('');
                }}
                style={{ borderColor: error ? '#ff4d4f' : '' }}
              />
              {error && (
                <p style={{
                  color: '#ff4d4f',
                  fontSize: 13,
                  marginTop: 6
                }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? <><div className="spin" style={{ width: 16, height: 16 }} /> Signing in...</>
                : 'Sign In →'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--txt2)', fontSize: 13 }}>
            No account? <Link to="/register" style={{ color: 'var(--accent2)' }}>Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
