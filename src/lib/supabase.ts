import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Conference {
  id: string;
  title: string;
  description: string;
  short_description: string;
  banner_url: string;
  video_url?: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export interface AgendaItem {
  id: string;
  conference_id: string;
  time_start: string;
  time_end: string;
  title: string;
  description?: string;
  speaker_id?: string;
  day_number: number;
}

export interface Speaker {
  id: string;
  conference_id: string;
  name: string;
  title: string;
  company: string;
  bio?: string;
  avatar_url?: string;
}

export interface Registration {
  id: string;
  conference_id: string;
  name: string;
  email: string;
  organization: string;
  created_at: string;
}

export async function getPublishedConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('status', 'published')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data as Conference[];
}

export async function getAllConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Conference[];
}

export async function getConferenceById(id: string) {
  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Conference;
}

export async function getAgendaByConference(conferenceId: string) {
  const { data, error } = await supabase
    .from('agenda')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('day_number')
    .order('time_start');
  if (error) throw error;
  return data as AgendaItem[];
}

export async function getSpeakersByConference(conferenceId: string) {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .eq('conference_id', conferenceId);
  if (error) throw error;
  return data as Speaker[];
}

export async function createRegistration(reg: Omit<Registration, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([reg])
    .select()
    .single();
  if (error) throw error;
  return data as Registration;
}

export async function getRegistrationsByConference(conferenceId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, conferences(title)')
    .eq('conference_id', conferenceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, conferences(title)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertConference(conf: Partial<Conference>) {
  const { data, error } = await supabase
    .from('conferences')
    .upsert([conf])
    .select()
    .single();
  if (error) throw error;
  return data as Conference;
}

export async function upsertAgendaItem(item: Partial<AgendaItem>) {
  const { data, error } = await supabase
    .from('agenda')
    .upsert([item])
    .select()
    .single();
  if (error) throw error;
  return data as AgendaItem;
}

export async function upsertSpeaker(speaker: Partial<Speaker>) {
  const { data, error } = await supabase
    .from('speakers')
    .upsert([speaker])
    .select()
    .single();
  if (error) throw error;
  return data as Speaker;
}

export async function deleteAgendaItem(id: string) {
  const { error } = await supabase.from('agenda').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteSpeaker(id: string) {
  const { error } = await supabase.from('speakers').delete().eq('id', id);
  if (error) throw error;
}
