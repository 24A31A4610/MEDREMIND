import { useEffect, useRef, useCallback } from 'react';
import type { Medication, DoseLog } from '@/lib/medication-store';

// Generate a pleasant alarm chime using Web Audio API
function playAlarmChime() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.2 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.6);
  });

  // Second round for emphasis
  setTimeout(() => {
    const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
    notes.forEach((freq, i) => {
      const osc = ctx2.createOscillator();
      const gain = ctx2.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx2.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx2.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.25, ctx2.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(ctx2.destination);
      osc.start(ctx2.currentTime + i * 0.15);
      osc.stop(ctx2.currentTime + i * 0.15 + 0.5);
    });
  }, 1200);
}

function showBrowserNotification(medName: string, dosage: string, time: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`💊 Time for ${medName}`, {
      body: `${dosage} — scheduled at ${time}`,
      icon: '💊',
      tag: `med-${medName}-${time}`,
    });
  }
}

export function useAlarmReminder(
  medications: Medication[],
  doseLogs: DoseLog[],
  onAlarmTriggered?: (medName: string, logId: string) => void
) {
  const triggeredRef = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentHH = String(now.getHours()).padStart(2, '0');
    const currentMM = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHH}:${currentMM}`;

    const pendingLogs = doseLogs.filter(l => l.status === 'pending');

    for (const log of pendingLogs) {
      const logTime = log.scheduled_time.slice(0, 5); // "HH:MM"
      const alarmKey = `${log.id}-${logTime}`;

      if (logTime === currentTime && !triggeredRef.current.has(alarmKey)) {
        triggeredRef.current.add(alarmKey);
        const med = medications.find(m => m.id === log.medication_id);
        if (med) {
          playAlarmChime();
          showBrowserNotification(med.name, med.dosage, logTime);
          onAlarmTriggered?.(med.name, log.id);
        }
      }
    }
  }, [medications, doseLogs, onAlarmTriggered]);

  // Check every 15 seconds
  useEffect(() => {
    checkAlarms(); // check immediately
    const interval = setInterval(checkAlarms, 15000);
    return () => clearInterval(interval);
  }, [checkAlarms]);
}
