import { useState, useCallback } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color: string;
  icon: string;
  notes?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenAt?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  date: string;
}

const COLORS = ['#3B9B6E', '#E8963E', '#5B8DEF', '#E85D75', '#9B6ED8', '#4ECDC4'];
const ICONS = ['💊', '💉', '🩹', '🧴', '💧', '🌿'];

const SAMPLE_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', times: ['08:00', '20:00'], color: COLORS[0], icon: '💊' },
  { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', times: ['09:00'], color: COLORS[1], icon: '💧' },
  { id: '3', name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily', times: ['08:00'], color: COLORS[2], icon: '🌿' },
  { id: '4', name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', times: ['07:30'], color: COLORS[3], icon: '🩹' },
];

const today = new Date().toISOString().split('T')[0];

const SAMPLE_LOGS: DoseLog[] = [
  { id: 'l1', medicationId: '1', scheduledTime: '08:00', takenAt: '08:05', status: 'taken', date: today },
  { id: 'l2', medicationId: '3', scheduledTime: '08:00', takenAt: '08:05', status: 'taken', date: today },
  { id: 'l3', medicationId: '4', scheduledTime: '07:30', takenAt: '07:32', status: 'taken', date: today },
  { id: 'l4', medicationId: '2', scheduledTime: '09:00', status: 'pending', date: today },
  { id: 'l5', medicationId: '1', scheduledTime: '20:00', status: 'pending', date: today },
];

export function useMedicationStore() {
  const [medications, setMedications] = useState<Medication[]>(SAMPLE_MEDICATIONS);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(SAMPLE_LOGS);

  const addMedication = useCallback((med: Omit<Medication, 'id' | 'color' | 'icon'>) => {
    const newMed: Medication = {
      ...med,
      id: Date.now().toString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
    };
    setMedications(prev => [...prev, newMed]);
    // Create dose logs for today
    const newLogs = med.times.map((time, i) => ({
      id: `${Date.now()}-${i}`,
      medicationId: newMed.id,
      scheduledTime: time,
      status: 'pending' as const,
      date: today,
    }));
    setDoseLogs(prev => [...prev, ...newLogs]);
  }, []);

  const markDose = useCallback((logId: string, status: 'taken' | 'skipped') => {
    setDoseLogs(prev => prev.map(log =>
      log.id === logId ? { ...log, status, takenAt: status === 'taken' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined } : log
    ));
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setDoseLogs(prev => prev.filter(l => l.medicationId !== id));
  }, []);

  const todayLogs = doseLogs.filter(l => l.date === today);
  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const adherenceRate = todayLogs.length > 0 ? Math.round((takenCount / todayLogs.length) * 100) : 0;

  return { medications, doseLogs: todayLogs, addMedication, markDose, deleteMedication, adherenceRate, takenCount, totalDoses: todayLogs.length };
}
