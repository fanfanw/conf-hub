'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DevLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'dev', password }),
    });
    const data = await res.json();
    if (data.ok) {
      sessionStorage.setItem('dev_auth', '1');
      router.push('/dev/dashboard');
    } else {
      setError('Invalid password');
    }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="scale-in" style={{ width: '100%', maxWidth: '380px' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(255,212,59,0.15)', borderRadius: '14px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🛠️
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              Developer Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Manage conferences and content</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input className="input" type="password" placeholder="Developer Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', margin: 0 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', background: 'var(--accent)', color: '#000' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
