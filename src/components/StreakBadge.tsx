import { motion } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Props {
  currentStreak: number;
  bestStreak: number;
}

export default function StreakBadge({ currentStreak, bestStreak }: Props) {
  const { t } = useI18n();

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'from-yellow-400 to-orange-500';
    if (currentStreak >= 14) return 'from-orange-400 to-red-500';
    if (currentStreak >= 7) return 'from-primary to-emerald-400';
    if (currentStreak >= 3) return 'from-blue-400 to-primary';
    return 'from-muted to-muted-foreground/30';
  };

  const getStreakEmoji = () => {
    if (currentStreak >= 30) return '🏆';
    if (currentStreak >= 14) return '🔥';
    if (currentStreak >= 7) return '⭐';
    if (currentStreak >= 3) return '✨';
    return '💪';
  };

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 10;
  const progress = Math.min((currentStreak / nextMilestone) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          {t('streakTitle')}
        </h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="w-3.5 h-3.5" />
          {t('best')}: {bestStreak} {t('days')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStreakColor()} flex items-center justify-center shadow-lg`}
          animate={currentStreak >= 3 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span className="text-2xl">{getStreakEmoji()}</span>
        </motion.div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-heading font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">{t('dayStreak')}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{t('nextMilestone')}: {nextMilestone} {t('days')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${getStreakColor()}`}
              />
            </div>
          </div>
        </div>
      </div>

      {currentStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          {milestones.filter(m => m <= currentStreak).map(m => (
            <div key={m} className="flex-shrink-0 flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3" /> {m} {t('days')}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
