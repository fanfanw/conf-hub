'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllConferences, upsertConference, getAgendaByConference, getSpeakersByConference,
  upsertAgendaItem, upsertSpeaker, deleteAgendaItem, deleteSpeaker,
  type Conference, type AgendaItem, type Speaker,
} from '@/lib/supabase';

type Tab = 'conferences' | 'agenda' | 'speakers';
const emptyConf: Partial<Conference> = { title: '', short_description: '', description: '', banner_url: '', location: '', start_date: '', end_date: '', status: 'draft' };

export default function DevDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('conferences');
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selected, setSelected] = useState<Conference | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [editConf, setEditConf] = useState<Partial<Conference> | null>(null);
  const [editItem, setEditItem] = useState<Partial<AgendaItem> | null>(null);
  const [editSpeaker, setEditSpeaker] = useState<Partial<Speaker> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('dev_auth')) {
      router.replace('/dev/login'); return;
    }
    loadConferences();
  }, []);

  async function loadConferences() {
    setLoading(true);
    const cs = await getAllConferences();
    setConferences(cs);
    setLoading(false);
  }

  async function selectConference(c: Conference) {
    setSelected(c);
    const [ag, sp] = await Promise.all([getAgendaByConference(c.id), getSpeakersByConference(c.id)]);
    setAgenda(ag); setSpeakers(sp);
    setTab('agenda');
  }

  async function saveConference() {
    if (!editConf) return;
    setSaving(true);
    try {
      await upsertConference(editConf);
      await loadConferences();
      setEditConf(null);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  }

  async function togglePublish(c: Conference) {
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    await upsertConference({ ...c, status: newStatus });
    await loadConferences();
    if (selected?.id === c.id) setSelected({ ...c, status: newStatus });
  }

  async function saveAgendaItem() {
    if (!editItem || !selected) return;
    setSaving(true);
    try {
      await upsertAgendaItem({ ...editItem, conference_id: selected.id });
      const ag = await getAgendaByConference(selected.id);
      setAgenda(ag); setEditItem(null);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  }

  async function saveSpeaker() {
    if (!editSpeaker || !selected) return;
    setSaving(true);
    try {
      await upsertSpeaker({ ...editSpeaker, conference_id: selected.id });
      const sp = await getSpeakersByConference(selected.id);
      setSpeakers(sp); setEditSpeaker(null);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  }

  const InputField = ({ label, value, onChange, type = 'text', multiline = false }: any) => (
    <div>
      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</label>
      {multiline ? (
        <textarea className="input" rows={3} value={value || ''} onChange={e => onChange(e.target.value)} style={{ resize: 'vertical' }} />
      ) : (
        <input className="input" type={type} value={value || ''} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );

  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ background: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>
          🛠️ Developer Portal
        </h1>
        <button className="btn-ghost" style={{ fontSize: '13px' }} onClick={() => { sessionStorage.removeItem('dev_auth'); router.push('/dev/login'); }}>
          Sign Out
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 61px)' }}>
        <aside style={{ width: '260px', background: 'var(--surface-2)', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '20px 12px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conferences</span>
            <button onClick={() => { setEditConf({ ...emptyConf }); setTab('conferences'); }}
              style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '8px' }}>Loading…</p>
          ) : conferences.map(c => (
            <div key={c.id} onClick={() => selectConference(c)} style={{
              padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
              background: selected?.id === c.id ? 'rgba(59,91,219,0.2)' : 'transparent',
              border: selected?.id === c.id ? '1px solid rgba(59,91,219,0.4)' : '1px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{c.title}</span>
                <span className={`badge badge-${c.status}`} style={{ fontSize: '9px' }}>{c.status}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{c.location}</span>
            </div>
          ))}
        </aside>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {selected && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {(['agenda', 'speakers'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '13px', padding: '8px 18px', textTransform: 'capitalize' }}>
                  {t === 'agenda' ? '📅 Agenda' : '🎤 Speakers'}
                </button>
              ))}
              <button onClick={() => setEditConf({ ...selected })} className="btn-ghost" style={{ fontSize: '13px', padding: '8px 18px', marginLeft: 'auto' }}>
                ✏️ Edit Conference
              </button>
              <button onClick={() => togglePublish(selected)} style={{ fontSize: '13px', padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, background: selected.status === 'published' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)', color: selected.status === 'published' ? '#f87171' : '#34d399' }}>
                {selected.status === 'published' ? '⛔ Unpublish' : '🚀 Publish'}
              </button>
            </div>
          )}

          {editConf !== null && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="card scale-in" style={{ width: '100%', maxWidth: '560px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: '0 0 24px', fontSize: '20px' }}>
                  {editConf.id ? 'Edit Conference' : 'New Conference'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <InputField label="Title" value={editConf.title} onChange={(v: string) => setEditConf(f => ({ ...f!, title: v }))} />
                  <InputField label="Short Description" value={editConf.short_description} onChange={(v: string) => setEditConf(f => ({ ...f!, short_description: v }))} multiline />
                  <InputField label="Full Description" value={editConf.description} onChange={(v: string) => setEditConf(f => ({ ...f!, description: v }))} multiline />
                  <InputField label="Banner Image URL" value={editConf.banner_url} onChange={(v: string) => setEditConf(f => ({ ...f!, banner_url: v }))} />
                  <InputField label="Location" value={editConf.location} onChange={(v: string) => setEditConf(f => ({ ...f!, location: v }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <InputField label="Start Date" type="date" value={editConf.start_date} onChange={(v: string) => setEditConf(f => ({ ...f!, start_date: v }))} />
                    <InputField label="End Date" type="date" value={editConf.end_date} onChange={(v: string) => setEditConf(f => ({ ...f!, end_date: v }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button className="btn-primary" onClick={saveConference} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button className="btn-ghost" onClick={() => setEditConf(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {selected && tab === 'agenda' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: 0 }}>Agenda</h2>
                <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => setEditItem({ conference_id: selected.id, day_number: 1 })}>+ Add Item</button>
              </div>
              {agenda.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No agenda items yet</div>
              ) : agenda.map(item => (
                <div key={item.id} className="card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>Day {item.day_number} · {item.time_start}–{item.time_end}</span>
                    <p style={{ color: '#fff', fontWeight: 600, margin: '4px 0 0', fontSize: '14px' }}>{item.title}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setEditItem(item)}>Edit</button>
                    <button style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                      onClick={async () => { await deleteAgendaItem(item.id); setAgenda(a => a.filter(x => x.id !== item.id)); }}>Del</button>
                  </div>
                </div>
              ))}
              {editItem !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <div className="card scale-in" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: '0 0 24px', fontSize: '20px' }}>Agenda Item</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <InputField label="Title" value={editItem.title} onChange={(v: string) => setEditItem(f => ({ ...f!, title: v }))} />
                      <InputField label="Description" value={editItem.description} onChange={(v: string) => setEditItem(f => ({ ...f!, description: v }))} multiline />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <InputField label="Day" type="number" value={editItem.day_number} onChange={(v: string) => setEditItem(f => ({ ...f!, day_number: parseInt(v) }))} />
                        <InputField label="Start" type="time" value={editItem.time_start} onChange={(v: string) => setEditItem(f => ({ ...f!, time_start: v }))} />
                        <InputField label="End" type="time" value={editItem.time_end} onChange={(v: string) => setEditItem(f => ({ ...f!, time_end: v }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button className="btn-primary" onClick={saveAgendaItem} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                      <button className="btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {selected && tab === 'speakers' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: 0 }}>Speakers</h2>
                <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => setEditSpeaker({ conference_id: selected.id })}>+ Add Speaker</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {speakers.map(s => (
                  <div key={s.id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={s.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{s.name.charAt(0)}</div>
                      )}
                      <div>
                        <p style={{ fontWeight: 700, color: '#fff', margin: 0, fontSize: '14px' }}>{s.name}</p>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '12px' }}>{s.company}</p>
                      </div>
                    </div>
                    <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600, margin: '0 0 12px' }}>{s.title}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setEditSpeaker(s)}>Edit</button>
                      <button style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                        onClick={async () => { await deleteSpeaker(s.id); setSpeakers(sp => sp.filter(x => x.id !== s.id)); }}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
              {editSpeaker !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <div className="card scale-in" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: '0 0 24px', fontSize: '20px' }}>Speaker</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <InputField label="Name" value={editSpeaker.name} onChange={(v: string) => setEditSpeaker(f => ({ ...f!, name: v }))} />
                      <InputField label="Title / Role" value={editSpeaker.title} onChange={(v: string) => setEditSpeaker(f => ({ ...f!, title: v }))} />
                      <InputField label="Company" value={editSpeaker.company} onChange={(v: string) => setEditSpeaker(f => ({ ...f!, company: v }))} />
                      <InputField label="Bio" value={editSpeaker.bio} onChange={(v: string) => setEditSpeaker(f => ({ ...f!, bio: v }))} multiline />
                      <InputField label="Avatar URL" value={editSpeaker.avatar_url} onChange={(v: string) => setEditSpeaker(f => ({ ...f!, avatar_url: v }))} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button className="btn-primary" onClick={saveSpeaker} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                      <button className="btn-ghost" onClick={() => setEditSpeaker(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!selected && !editConf && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
              <p>Select a conference from the sidebar, or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
