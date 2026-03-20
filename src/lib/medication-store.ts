import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color: string;
  icon: string;
  photo_url?: string | null;
  notes?: string | null;
}

export interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_at?: string | null;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  date: string;
}

export interface SymptomLog {
  id: string;
  medication_id: string;
  date: string;
  mood: string;
  symptoms: string[];
  notes?: string | null;
  created_at: string;
}

const COLORS = ['#3B9B6E', '#E8963E', '#5B8DEF', '#E85D75', '#9B6ED8', '#4ECDC4'];
const ICONS = ['💊', '💉', '🩹', '🧴', '💧', '🌿'];

const today = new Date().toISOString().split('T')[0];

export function useMedicationStore() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [allLogs, setAllLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      const [medsRes, logsRes, symptomRes, allLogsRes] = await Promise.all([
        supabase.from('medications').select('*'),
        supabase.from('dose_logs').select('*').eq('date', today),
        supabase.from('symptom_logs').select('*').eq('date', today),
        supabase.from('dose_logs').select('*').order('date', { ascending: false }),
      ]);
      if (medsRes.data) setMedications(medsRes.data as Medication[]);
      if (logsRes.data) setDoseLogs(logsRes.data as DoseLog[]);
      if (symptomRes.data) setSymptomLogs(symptomRes.data as SymptomLog[]);
      if (allLogsRes.data) setAllLogs(allLogsRes.data as DoseLog[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const addMedication = useCallback(async (med: { name: string; dosage: string; frequency: string; times: string[]; notes?: string; photo_url?: string }) => {
    const newMed = {
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      photo_url: med.photo_url || null,
      notes: med.notes || null,
    };

    const { data, error } = await supabase.from('medications').insert(newMed).select().single();
    if (error || !data) return;

    setMedications(prev => [...prev, data as Medication]);

    // Create dose logs for today
    const logs = med.times.map(time => ({
      medication_id: data.id,
      scheduled_time: time,
      status: 'pending',
      date: today,
    }));

    const { data: logsData } = await supabase.from('dose_logs').insert(logs).select();
    if (logsData) setDoseLogs(prev => [...prev, ...(logsData as DoseLog[])]);
  }, []);

  const markDose = useCallback(async (logId: string, status: 'taken' | 'skipped') => {
    const takenAt = status === 'taken' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : null;
    const { error } = await supabase.from('dose_logs').update({ status, taken_at: takenAt }).eq('id', logId);
    if (!error) {
      setDoseLogs(prev => prev.map(log => log.id === logId ? { ...log, status, taken_at: takenAt } : log));
    }
  }, []);

  const deleteMedication = useCallback(async (id: string) => {
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (!error) {
      setMedications(prev => prev.filter(m => m.id !== id));
      setDoseLogs(prev => prev.filter(l => l.medication_id !== id));
    }
  }, []);

  const todayLogs = doseLogs.filter(l => l.date === today);
  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const adherenceRate = todayLogs.length > 0 ? Math.round((takenCount / todayLogs.length) * 100) : 0;

  return { medications, doseLogs: todayLogs, addMedication, markDose, deleteMedication, adherenceRate, takenCount, totalDoses: todayLogs.length, loading };
}
