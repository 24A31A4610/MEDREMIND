import { motion } from 'framer-motion';
import { Pill, CalendarDays, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import { useMedicationStore } from '@/lib/medication-store';
import { useI18n } from '@/lib/i18n';
import MedicationCard from '@/components/MedicationCard';
import AdherenceRing from '@/components/AdherenceRing';
import AddMedicationDialog from '@/components/AddMedicationDialog';
import UpcomingReminder from '@/components/UpcomingReminder';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Index = () => {
  const { medications, doseLogs, addMedication, markDose, deleteMedication, adherenceRate, takenCount, totalDoses, loading } = useMedicationStore();
  const { t } = useI18n();

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 18 ? t('goodAfternoon') : t('goodEvening');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <AddMedicationDialog onAdd={addMedication} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6 pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold text-foreground">{greeting} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card border border-border p-5 flex flex-col items-center">
            <AdherenceRing percentage={adherenceRate} taken={takenCount} total={totalDoses} />
          </motion.div>
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Pill className="w-3.5 h-3.5" /> {t('activeMedicines')}
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{medications.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> {t('dosesLeft')}
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{totalDoses - takenCount}</p>
            </motion.div>
          </div>
        </div>

        <UpcomingReminder medications={medications} logs={doseLogs} />

        <div>
          <h2 className="font-heading font-bold text-lg text-foreground mb-3">{t('yourMedications')}</h2>
          <div className="space-y-3">
            {medications.map(med => (
              <div key={med.id} className="relative group">
                <MedicationCard
                  medication={med}
                  logs={doseLogs.filter(l => l.medication_id === med.id)}
                  onMarkDose={markDose}
                />
                <button
                  onClick={() => deleteMedication(med.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {medications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{t('addMedication')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
