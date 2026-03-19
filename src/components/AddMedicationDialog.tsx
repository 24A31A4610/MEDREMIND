import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Camera, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onAdd: (med: { name: string; dosage: string; frequency: string; times: string[]; notes?: string; photo_url?: string }) => void;
}

export default function AddMedicationDialog({ onAdd }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [times, setTimes] = useState(['08:00']);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const addTime = () => setTimes(prev => [...prev, '12:00']);
  const removeTime = (i: number) => setTimes(prev => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) => setTimes(prev => prev.map((t, idx) => idx === i ? val : t));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('medication-photos').upload(path, file);

    if (!error) {
      const { data: urlData } = supabase.storage.from('medication-photos').getPublicUrl(path);
      setPhotoUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    onAdd({ name, dosage, frequency, times, photo_url: photoUrl || undefined });
    setName(''); setDosage(''); setFrequency('Once daily'); setTimes(['08:00']); setPhotoUrl(''); setPhotoPreview('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2 px-6 shadow-lg">
          <Plus className="w-4 h-4" /> {t('addMedication')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{t('addNewMedication')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>{t('medicinePhoto')}</Label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30">
                    <img src={photoPreview} alt="Medicine" className="w-full h-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{t('uploadPhoto')}</span>
                  </div>
                )}
              </label>
              <p className="text-xs text-muted-foreground flex-1">{t('photoHelp')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('medicineName')}</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('egName')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosage">{t('dosage')}</Label>
            <Input id="dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder={t('egDosage')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>{t('frequency')}</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Once daily">{t('onceDaily')}</SelectItem>
                <SelectItem value="Twice daily">{t('twiceDaily')}</SelectItem>
                <SelectItem value="Three times daily">{t('thriceDaily')}</SelectItem>
                <SelectItem value="As needed">{t('asNeeded')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('reminderTimes')}</Label>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input type="time" value={t} onChange={e => updateTime(i, e.target.value)} className="rounded-xl flex-1" />
                  {times.length > 1 && (
                    <button type="button" onClick={() => removeTime(i)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTime} className="text-sm text-primary font-medium hover:underline">{t('addAnotherTime')}</button>
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={!name || !dosage || uploading}>{t('saveMedication')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
