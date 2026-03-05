'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllRegistrations, getAllConferences, type Conference } from '@/lib/supabase';

function exportCSV(rows: any[], filename: string) {
  const headers = ['ID', 'Conference', 'Name', 'Email', 'Organization', 'Registered At'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.id, `"${r.conferences?.title || ''}"`, `"${r.name}"`, r.email, `"${r.organization}"`, r.created_at
    ].join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('admin_auth')) {
      router.replace('/admin/login');
      return;
    }
    Promise.all([getAllRegistrations(), getAllConferences()])
      .then(([regs, confs]) => { setRegistrations(regs || []); setConferences(confs || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? registrations : registrations.filter(r => r.conference_id === filter);

  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ background: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>
          Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ fontSize: '13px' }} onClick={() => exportCSV(filtered, `registrations-${Date.now()}.csv`)}>
            ⬇ Export CSV
          </button>
          <button className="btn-ghost" style={{ fontSize: '13px' }} onClick={() => { sessionStorage.removeItem('admin_auth'); router.push('/admin/login'); }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Registrations', value: registrations.length, emoji: '🎟️' },
            { label: 'Conferences', value: conferences.length, emoji: '🏛️' },
            { label: 'Published', value: conferences.filter(c => c.status === 'published').length, emoji: '✅' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button className={filter === 'all' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => setFilter('all')}>All</button>
          {conferences.map(c => (
            <button key={c.id} className={filter === c.id ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => setFilter(c.id)}>
              {c.title}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p>No registrations yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Name', 'Email', 'Organization', 'Conference', 'Registered'].map(h => (
                    <th key={h} style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '14px 16px', color: '#fff', fontSize: '14px' }}>{r.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>{r.email}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>{r.organization}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>{r.conferences?.title}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
