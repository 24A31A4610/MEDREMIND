import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface Props {
  onAdd: (med: { name: string; dosage: string; frequency: string; times: string[]; notes?: string }) => void;
}

export default function AddMedicationDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [times, setTimes] = useState(['08:00']);

  const addTime = () => setTimes(prev => [...prev, '12:00']);
  const removeTime = (i: number) => setTimes(prev => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) => setTimes(prev => prev.map((t, idx) => idx === i ? val : t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    onAdd({ name, dosage, frequency, times });
    setName(''); setDosage(''); setFrequency('Once daily'); setTimes(['08:00']);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2 px-6 shadow-lg">
          <Plus className="w-4 h-4" /> Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add New Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Metformin" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 500mg" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Once daily">Once daily</SelectItem>
                <SelectItem value="Twice daily">Twice daily</SelectItem>
                <SelectItem value="Three times daily">Three times daily</SelectItem>
                <SelectItem value="As needed">As needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reminder Times</Label>
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
              <button type="button" onClick={addTime} className="text-sm text-primary font-medium hover:underline">+ Add another time</button>
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={!name || !dosage}>Save Medication</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
