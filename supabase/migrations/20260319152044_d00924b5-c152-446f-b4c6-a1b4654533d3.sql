
-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dose_logs table
CREATE TABLE public.dose_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  taken_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;

-- For prototype: allow all operations (no auth yet)
CREATE POLICY "Allow all access to medications" ON public.medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dose_logs" ON public.dose_logs FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for medication photos
INSERT INTO storage.buckets (id, name, public) VALUES ('medication-photos', 'medication-photos', true);

-- Storage policies
CREATE POLICY "Medication photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'medication-photos');
CREATE POLICY "Anyone can upload medication photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medication-photos');
CREATE POLICY "Anyone can update medication photos" ON storage.objects FOR UPDATE USING (bucket_id = 'medication-photos');
CREATE POLICY "Anyone can delete medication photos" ON storage.objects FOR DELETE USING (bucket_id = 'medication-photos');
