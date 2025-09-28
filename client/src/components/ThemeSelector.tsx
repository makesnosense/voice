import { Monitor, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import baseStyles from '../styles/BaseCard.module.css';
import buttonStyles from '../styles/Buttons.module.css';
import themeSelectorStyles from './ThemeSelector.module.css';

const THEME_OPTIONS = [
  { mode: 'system' as const, icon: Monitor, label: 'System' },
  { mode: 'light' as const, icon: Sun, label: 'Light' },
  { mode: 'dark' as const, icon: Moon, label: 'Dark' }
];

export default function ThemeSelector() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className={`${baseStyles.card} ${themeSelectorStyles.themeSelectorCard}`}>
      <div className={`${themeSelectorStyles.buttonGroup} `}>
        {THEME_OPTIONS.map(({ mode: themeMode, icon: Icon, label }) => (
          <button
            key={themeMode}
            onClick={() => setMode(themeMode)}
            className={`${buttonStyles.iconButton} ${buttonStyles.button}  `}
            title={`Switch to ${label.toLowerCase()} theme`}
            aria-label={`${label} theme`}
          >
            <Icon
              size={18} />
          </button>
        ))}
      </div>
    </div >
  );
}