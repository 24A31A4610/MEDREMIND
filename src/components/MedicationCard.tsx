import { motion } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import type { Medication, DoseLog } from '@/lib/medication-store';

interface Props {
  medication: Medication;
  logs: DoseLog[];
  onMarkDose: (logId: string, status: 'taken' | 'skipped') => void;
}

export default function MedicationCard({ medication, logs, onMarkDose }: Props) {
  const pendingLogs = logs.filter(l => l.status === 'pending');
  const takenLogs = logs.filter(l => l.status === 'taken');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: medication.color + '18' }}
          >
            {medication.icon}
          </div>
          <div>
            <h3 className="font-heading font-bold text-card-foreground text-lg">{medication.name}</h3>
            <p className="text-muted-foreground text-sm">{medication.dosage} · {medication.frequency}</p>
          </div>
        </div>
        {takenLogs.length === logs.length && logs.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
            <Check className="w-3 h-3" /> Done
          </span>
        )}
      </div>

      {pendingLogs.length > 0 && (
        <div className="space-y-2 mt-4">
          {pendingLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Due at {log.scheduledTime}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onMarkDose(log.id, 'taken')}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMarkDose(log.id, 'skipped')}
                  className="w-9 h-9 rounded-full bg-muted-foreground/20 text-muted-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingLogs.length === 0 && takenLogs.length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          All doses taken for today
        </div>
      )}
    </motion.div>
  );
}
