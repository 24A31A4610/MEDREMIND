import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import type { Medication, DoseLog } from '@/lib/medication-store';

interface Props {
  medications: Medication[];
  logs: DoseLog[];
}

export default function UpcomingReminder({ medications, logs }: Props) {
  const pending = logs
    .filter(l => l.status === 'pending')
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const next = pending[0];
  const med = next ? medications.find(m => m.id === next.medicationId) : null;

  if (!next || !med) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-secondary p-5 text-center"
      >
        <p className="text-secondary-foreground font-medium">🎉 All done for today!</p>
        <p className="text-sm text-muted-foreground mt-1">Great job keeping up with your medications.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-5 border-2 border-primary/20 bg-primary/5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Next Reminder</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: med.color + '18' }}>
          {med.icon}
        </div>
        <div>
          <p className="font-heading font-bold text-foreground">{med.name} — {med.dosage}</p>
          <p className="text-sm text-muted-foreground">Scheduled at {next.scheduledTime}</p>
        </div>
      </div>
    </motion.div>
  );
}
