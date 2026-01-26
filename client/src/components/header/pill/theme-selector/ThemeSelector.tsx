import { useRef } from 'react';
import { Monitor, Sun, Moon, ChevronDown } from 'lucide-react';
import { useThemeStore, MODES, type Mode } from '../../../../stores/useThemeStore';
import baseStyles from '../../../../styles/BaseCard.module.css';
import themeSelectorStyles from './ThemeSelector.module.css';

const MODE_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

interface ThemeSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ThemeSelector({ isOpen, onToggle }: ThemeSelectorProps) {
  const { selectedMode, setSelectedMode } = useThemeStore();

  const themeRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = MODE_ICONS[selectedMode];

  const handleSelect = (selectedMode: Mode) => {
    setSelectedMode(selectedMode);
    onToggle();
  };

  return (
    <div className={themeSelectorStyles.themeSection} ref={themeRef}>
      <button
        onClick={() => onToggle()}
        className={themeSelectorStyles.themeButton}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon
          size={18}
          className={`${themeSelectorStyles.triggerIcon} ${themeSelectorStyles[selectedMode]}`}
        />
        <ChevronDown
          size={14}
          className={`${themeSelectorStyles.chevron} ${isOpen ? themeSelectorStyles.open : ''}`}
        />
      </button>

      {isOpen && (
        <div className={`${themeSelectorStyles.dropdown} ${baseStyles.card}`} role="listbox">
          {MODES.map((mode) => {
            const Icon = MODE_ICONS[mode];
            return (
              <button
                key={mode}
                onClick={() => handleSelect(mode)}
                className={`${themeSelectorStyles.option} ${themeSelectorStyles[mode]} ${mode === selectedMode ? themeSelectorStyles.active : ''}`}
                role="option"
                aria-selected={mode === selectedMode}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
