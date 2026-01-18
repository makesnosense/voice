import { useState, useRef, useEffect } from 'react';
import { Monitor, Sun, Moon, ChevronDown } from 'lucide-react';
import { useThemeStore, MODES, type Mode } from '../../../stores/useThemeStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import styles from './ThemeSelector.module.css';

const MODE_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export default function ThemeSelector() {
  const { selectedMode, setSelectedMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = MODE_ICONS[selectedMode];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (selectedMode: Mode) => {
    setSelectedMode(selectedMode);
    setIsOpen(false);
  };

  return (
    <div className={styles.themeSection} ref={themeRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.themeButton}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon size={18} className={`${styles.triggerIcon} ${styles[selectedMode]}`} />
        <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} ${baseStyles.card}`} role="listbox">
          {MODES.map((mode) => {
            const Icon = MODE_ICONS[mode];
            return (
              <button
                key={mode}
                onClick={() => handleSelect(mode)}
                className={`${styles.option} ${styles[mode]} ${mode === selectedMode ? styles.active : ''}`}
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
