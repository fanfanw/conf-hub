import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getConferenceById, getAgendaByConference, getSpeakersByConference } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

export const revalidate = 60;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ConferenceDetailPage({ params }: { params: { id: string } }) {
  let conference, agenda, speakers;
  try {
    conference = await getConferenceById(params.id);
    if (!conference || conference.status !== 'published') return notFound();
    [agenda, speakers] = await Promise.all([
      getAgendaByConference(params.id),
      getSpeakersByConference(params.id),
    ]);
  } catch {
    return notFound();
  }

  const days = Array.from(new Set(agenda.map(a => a.day_number))).sort();


  return (
    <>
      <Navbar />
      <main>
        <div style={{ position: 'relative', height: 'clamp(260px, 40vw, 480px)', overflow: 'hidden' }}>
          {conference.banner_url ? (
            <img src={conference.banner_url} alt={conference.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0d1f6e, #3b5bdb)' }} />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.4) 60%, transparent 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 'clamp(24px, 5vw, 60px)',
          }}>
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              📍 {conference.location}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 56px)', color: '#fff',
              lineHeight: 1.1, letterSpacing: '-0.02em',
              maxWidth: '700px', margin: '0 0 16px',
            }}>
              {conference.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
              {formatDate(conference.start_date)}
              {conference.end_date !== conference.start_date && ` → ${formatDate(conference.end_date)}`}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'start', marginBottom: '64px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                About this Conference
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
                {conference.description}
              </p>
            </div>
            <div style={{ minWidth: '180px' }}>
              <Link href={`/register/${conference.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                Register Now →
              </Link>
            </div>
          </div>

          {speakers.length > 0 && (
            <section style={{ marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
                Speakers
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {speakers.map(s => (
                  <div key={s.id} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
                    ) : (
                      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--brand)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: '0 0 4px', fontSize: '15px' }}>{s.name}</p>
                    <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}>{s.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>{s.company}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {agenda.length > 0 && (
            <section style={{ marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
                Agenda
              </h2>
              {days.map(day => (
                <div key={day} style={{ marginBottom: '40px' }}>
                  <h3 style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    Day {day}
                  </h3>
                  <div style={{ borderLeft: '2px solid rgba(59,91,219,0.4)', paddingLeft: '28px' }}>
                    {agenda.filter(a => a.day_number === day).map(item => (
                      <div key={item.id} className="timeline-item" style={{ position: 'relative', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, minWidth: '100px', paddingTop: '2px' }}>
                            {item.time_start} – {item.time_end}
                          </span>
                          <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff', margin: '0 0 4px', fontSize: '15px' }}>{item.title}</p>
                            {item.description && <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface-2)', borderRadius: '20px', border: '1px solid rgba(59,91,219,0.3)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Ready to join?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Secure your spot at {conference.title}</p>
            <Link href={`/register/${conference.id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: '16px', padding: '14px 36px' }}>
              Register Now →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
