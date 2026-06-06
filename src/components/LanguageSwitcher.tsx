import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getLanguageAttributes, normalizeLanguage } from '@/lib/language';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (newLang: string) => {
    const lang = normalizeLanguage(newLang);
    void i18n.changeLanguage(lang);
    localStorage.setItem('app_lang', lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    const { lang: htmlLang, dir } = getLanguageAttributes(lang);
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = dir;
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-accent/10 hover:text-primary"
        aria-label="Toggle language"
      >
        <Globe className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-32 rounded-xl border border-border bg-card shadow-lg z-50">
          <div className="p-2 flex flex-col gap-1">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-2 text-sm text-start rounded-md transition-colors ${i18n.language === 'en' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-accent/10'}`}
            >
              English
            </button>
            <button 
              onClick={() => changeLanguage('ar')}
              className={`px-3 py-2 text-sm text-start rounded-md transition-colors ${i18n.language === 'ar' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-accent/10'}`}
            >
              العربية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
