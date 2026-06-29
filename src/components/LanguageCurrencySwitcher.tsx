import { useTranslation } from 'react-i18next';

export default function LanguageCurrencySwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <select 
        value={i18n.resolvedLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-500"
      >
        <option value="id">🇮🇩 IDR</option>
        <option value="en">🇺🇸 USD</option>
      </select>
    </div>
  );
}
