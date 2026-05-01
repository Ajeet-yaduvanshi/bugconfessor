import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon:'🧠', title:'Socratic Mode',         desc:'AI guides you with targeted questions until YOU find the bug.',           color:'var(--accent2)' },
  { icon:'🦆', title:'Rubber Duck Mode',       desc:"AI acts clueless. Explaining to it accidentally reveals your mistakes.",  color:'var(--yellow)' },
  { icon:'📊', title:'Session Scorecards',     desc:'Each session ends with a skill rating, fallacy detection & review plan.', color:'var(--green)'  },
  { icon:'📈', title:'Bug Pattern Analytics',  desc:'Track recurring mistakes so you stop making the same errors twice.',      color:'var(--blue)'   },
];

export default function Landing() {
  return (
    <div style={{ minHeight:'100vh', fontFamily:'var(--mono)' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:64, padding:'0 40px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(7,7,13,.88)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:20 }}>
          Bug<span style={{ color:'var(--accent2)' }}>Confessor</span>
        </span>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login"    className="btn btn-secondary" style={{ padding:'8px 18px' }}>Login</Link>
          <Link to="/register" className="btn btn-primary"   style={{ padding:'8px 18px' }}>Get Started</Link>
        </div>
      </nav>

      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', textAlign:'center', padding:'100px 24px 60px', position:'relative' }}>
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)',
          width:600, height:600, background:'radial-gradient(circle, rgba(124,58,237,.1) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px',
          background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.3)',
          borderRadius:999, fontSize:12, color:'var(--accent2)', marginBottom:32,
          letterSpacing:'.1em', textTransform:'uppercase' }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--accent2)',display:'inline-block',animation:'pulse 1.5s infinite' }} />
          Powered by Google Gemini · Free to use
        </div>
        <h1 style={{ fontFamily:'var(--display)', fontSize:'clamp(38px,7vw,76px)',
          fontWeight:800, lineHeight:1.05, letterSpacing:'-.03em', marginBottom:22, maxWidth:860 }}>
          Stop copy-pasting fixes.<br />
          <span style={{ color:'var(--accent2)' }}>Start thinking.</span>
        </h1>
        <p style={{ fontSize:17, color:'var(--txt2)', maxWidth:520, lineHeight:1.7, marginBottom:44 }}>
          BugConfessor uses the Socratic method and Rubber Duck debugging to teach you <em>how</em> to find bugs — not just what the bug is.
        </p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
          <Link to="/register" className="btn btn-primary"   style={{ fontSize:15, padding:'13px 30px' }}>Start Debugging Free →</Link>
          <Link to="/login"    className="btn btn-secondary" style={{ fontSize:15, padding:'13px 30px' }}>Sign In</Link>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:44, flexWrap:'wrap', justifyContent:'center' }}>
          {['Python','JavaScript','Java','C++'].map(l => <span key={l} className="badge bp">{l}</span>)}
        </div>
      </section>

      <section style={{ padding:'70px 24px', maxWidth:1060, margin:'0 auto' }}>
        <h2 style={{ fontFamily:'var(--display)', fontSize:'clamp(26px,4vw,42px)',
          textAlign:'center', marginBottom:52, letterSpacing:'-.02em' }}>
          Two modes. One goal: <span style={{ color:'var(--accent2)' }}>make you think.</span>
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(230px,1fr))', gap:18 }}>
          {features.map((f,i) => (
            <div key={i} className="card" style={{ transition:'var(--ease)', cursor:'default' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=f.color;e.currentTarget.style.transform='translateY(-4px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}>
              <div style={{ fontSize:30, marginBottom:10 }}>{f.icon}</div>
              <h3 style={{ fontFamily:'var(--display)', fontSize:17, color:f.color, marginBottom:6 }}>{f.title}</h3>
              <p style={{ color:'var(--txt2)', lineHeight:1.6, fontSize:13 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign:'center', padding:'70px 24px 110px', borderTop:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'var(--display)', fontSize:34, marginBottom:14 }}>Ready to confess your bugs?</h2>
        <p style={{ color:'var(--txt2)', marginBottom:30 }}>Free. No credit card. Powered by Google Gemini.</p>
        <Link to="/register" className="btn btn-primary" style={{ fontSize:15, padding:'13px 34px' }}>
          Create Free Account →
        </Link>
      </section>
    </div>
  );
}
