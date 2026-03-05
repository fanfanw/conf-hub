import Link from 'next/link';
import type { Conference } from '@/lib/supabase';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ConferenceCard({ conf }: { conf: Conference }) {
  return (
    <Link href={`/conference/${conf.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '200px', background: 'var(--brand-dark)', overflow: 'hidden' }}>
          {conf.banner_url ? (
            <img src={conf.banner_url} alt={conf.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0d1f6e 0%, #3b5bdb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px', opacity: 0.3 }}>🎯</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(10,15,30,0.9), transparent)', padding: '40px 20px 16px' }}>
            <span className="badge badge-published" style={{ fontSize: '10px' }}>{conf.location}</span>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
            {conf.title}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>
            {conf.short_description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>
              📅 {formatDate(conf.start_date)}
            </span>
            {conf.end_date !== conf.start_date && (
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→ {formatDate(conf.end_date)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
