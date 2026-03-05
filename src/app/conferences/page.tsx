import { getPublishedConferences, type Conference } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import ConferenceCard from '@/components/ui/ConferenceCard';

export const revalidate = 60;

export default async function ConferencesPage() {
  let conferences: Conference[] = [];
  try {
    conferences = await getPublishedConferences();
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', fontSize: '13px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Upcoming Events
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Discover World-Class<br />
            <span style={{ color: 'var(--brand)' }}>Conferences</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
            Connect with industry leaders, expand your knowledge, and be part of the conversation.
          </p>
        </div>

        {conferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px' }}>No conferences published yet.</p>
            <p style={{ fontSize: '14px' }}>Check back soon!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {conferences.map((conf, i) => (
              <div key={conf.id} className="fade-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <ConferenceCard conf={conf} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
