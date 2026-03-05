'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const path = usePathname();
  const isAdmin = path.startsWith('/admin');
  const isDev = path.startsWith('/dev');

  if (isAdmin || isDev) return null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(15,23,41,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 24px',
      height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/conferences" style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '20px',
        color: '#fff',
        textDecoration: 'none',
        letterSpacing: '-0.02em',
      }}>
        Conf<span style={{ color: 'var(--accent)' }}>Hub</span>
      </Link>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link href="/conferences" style={{
          textDecoration: 'none',
          fontSize: '14px', fontWeight: 500, padding: '6px 12px',
          borderRadius: '8px',
          background: path === '/conferences' ? 'rgba(59,91,219,0.2)' : 'transparent',
          color: path === '/conferences' ? '#fff' : 'var(--text-muted)',
        }}>
          Conferences
        </Link>
      </div>
    </nav>
  );
}
