import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface Props {
  percentage: number;
  taken: number;
  total: number;
}

export default function AdherenceRing({ percentage, taken, total }: Props) {
  const { t } = useI18n();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <motion.circle
            cx="64" cy="64" r={radius} fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-heading font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground">{taken}/{total} {t('doses')}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{t('todayAdherence')}</p>
    </div>
  );
}
