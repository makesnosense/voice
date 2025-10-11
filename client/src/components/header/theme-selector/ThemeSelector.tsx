import { Monitor, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../../stores/useThemeStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import themeSelectorStyles from './ThemeSelector.module.css';

const THEME_OPTIONS = [

  { mode: 'light' as const, icon: Sun, label: 'Light' },
  { mode: 'dark' as const, icon: Moon, label: 'Dark' },
  { mode: 'system' as const, icon: Monitor, label: 'System' },
];

export default function ThemeSelector() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className={`${themeSelectorStyles.themeSelectorCard} ${baseStyles.card}`}>
      <div className={themeSelectorStyles.buttonGroup}>
        {THEME_OPTIONS.map(({ mode: themeMode, icon: Icon, label }) => (
          <button
            key={themeMode}
            onClick={() => setMode(themeMode)}
            className={`${themeSelectorStyles.themeButton} ${themeSelectorStyles[themeMode]} ${mode === themeMode ? themeSelectorStyles.active : ''}`}
            data-button={themeMode}
            title={`Switch to ${label.toLowerCase()} theme`}
            aria-label={`${label} theme`}
            aria-pressed={mode === themeMode}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
