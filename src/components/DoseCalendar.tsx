import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import type { DoseLog } from '@/lib/medication-store';

interface Props {
  medications: { id: string; name: string; icon: string }[];
}

type DayStatus = 'perfect' | 'partial' | 'missed' | 'none' | 'future';

export default function DoseCalendar({ medications }: Props) {
  const { t } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [monthLogs, setMonthLogs] = useState<DoseLog[]>([]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    supabase
      .from('dose_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .then(({ data }) => {
        if (data) setMonthLogs(data as DoseLog[]);
      });
  }, [year, month, daysInMonth]);

  const getDayStatus = (day: number): DayStatus => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr > todayStr) return 'future';
    
    const dayLogs = monthLogs.filter(l => l.date === dateStr);
    if (dayLogs.length === 0) return 'none';
    
    const taken = dayLogs.filter(l => l.status === 'taken').length;
    if (taken === dayLogs.length) return 'perfect';
    if (taken > 0) return 'partial';
    return 'missed';
  };

  const statusColors: Record<DayStatus, string> = {
    perfect: 'bg-primary text-primary-foreground',
    partial: 'bg-accent/30 text-accent-foreground',
    missed: 'bg-destructive/15 text-destructive',
    none: 'bg-transparent text-foreground',
    future: 'bg-transparent text-muted-foreground/40',
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          {t('doseCalendar')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${statusColors[status]} ${
                isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''
              }`}
            >
              {day}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          {t('allTaken')}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent/30" />
          {t('partial')}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/15" />
          {t('allMissed')}
        </div>
      </div>
    </motion.div>
  );
}
