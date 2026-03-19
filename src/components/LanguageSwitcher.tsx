import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n, LANGUAGES } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
      <SelectTrigger className="w-auto gap-1.5 rounded-xl border-border bg-card h-9 px-3 text-sm">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
