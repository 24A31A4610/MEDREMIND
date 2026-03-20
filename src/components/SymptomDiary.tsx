import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Plus, SmilePlus, Frown, Meh, Smile, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Medication, SymptomLog } from '@/lib/medication-store';

const MOODS = [
  { value: 'great', icon: Heart, label: 'great', color: 'text-green-500' },
  { value: 'good', icon: Smile, label: 'good', color: 'text-emerald-400' },
  { value: 'okay', icon: Meh, label: 'okay', color: 'text-yellow-500' },
  { value: 'bad', icon: Frown, label: 'bad', color: 'text-orange-500' },
  { value: 'terrible', icon: SmilePlus, label: 'terrible', color: 'text-red-500' },
];

const COMMON_SYMPTOMS = [
  'headache', 'nausea', 'dizziness', 'fatigue', 'insomnia',
  'stomachPain', 'rash', 'drowsiness', 'appetite',
];

interface Props {
  medications: Medication[];
  symptomLogs: SymptomLog[];
  onAddLog: (log: { medication_id: string; mood: string; symptoms: string[]; notes?: string }) => Promise<void>;
}

export default function SymptomDiary({ medications, symptomLogs, onAddLog }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState('');
  const [mood, setMood] = useState('okay');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    if (!selectedMed) return;
    setSaving(true);
    await onAddLog({ medication_id: selectedMed, mood, symptoms, notes: notes || undefined });
    setSaving(false);
    setOpen(false);
    setSelectedMed('');
    setMood('okay');
    setSymptoms([]);
    setNotes('');
  };

  const todayLogs = symptomLogs;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-primary" />
          {t('symptomDiary')}
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-3.5 h-3.5" /> {t('logSymptom')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('logSymptom')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('selectMedicine')}</label>
                <div className="flex flex-wrap gap-2">
                  {medications.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMed(m.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedMed === m.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {m.icon} {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('howFeeling')}</label>
                <div className="flex gap-2">
                  {MOODS.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                          mood === m.value ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${m.color}`} />
                        <span className="text-xs text-muted-foreground">{t(m.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('sideEffects')}</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        symptoms.includes(s)
                          ? 'bg-destructive/15 text-destructive border border-destructive/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('additionalNotes')}</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="h-20"
                />
              </div>

              <Button onClick={handleSave} disabled={!selectedMed || saving} className="w-full">
                {saving ? t('saving') : t('saveEntry')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {todayLogs.length > 0 ? (
        <div className="space-y-2">
          {todayLogs.map(log => {
            const med = medications.find(m => m.id === log.medication_id);
            const moodInfo = MOODS.find(m => m.value === log.mood);
            const MoodIcon = moodInfo?.icon || Meh;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border border-border p-3 flex items-start gap-3"
              >
                <div className={`mt-0.5 ${moodInfo?.color || ''}`}>
                  <MoodIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{med?.icon} {med?.name}</p>
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.symptoms.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs">{t(s)}</Badge>
                      ))}
                    </div>
                  )}
                  {log.notes && <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-4 text-center text-muted-foreground text-sm">
          {t('noSymptomLogs')}
        </div>
      )}
    </div>
  );
}
