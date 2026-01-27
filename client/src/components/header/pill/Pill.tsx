import { useState, useRef, useEffect } from 'react';
import ThemeSelector from './theme-selector/ThemeSelector';
import { User, KeyRound } from 'lucide-react';
import baseStyles from '../../../styles/BaseCard.module.css';
import pillStyles from './Pill.module.css';
import { useAuthStore } from '../../../stores/useAuthStore';
import LoginDropdown from './login-dropdown/LoginDropdown';
import UserMenu from './user-menu/UserMenu';
import type { ObjectValues } from '../../../../../shared/types';

const OPEN_DROPDOWN = {
  THEME: 'theme',
  USER: 'user',
} as const;

type OpenDropdown = ObjectValues<typeof OPEN_DROPDOWN> | null;

export default function Pill() {
  const { isAuthenticated, authSuccessDelay, setAuthSuccessDelay } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // any change in dropdowns resets delay
  useEffect(() => {
    setAuthSuccessDelay(false);
  }, [openDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleUserToggle = () => {
    setOpenDropdown(openDropdown === OPEN_DROPDOWN.USER ? null : OPEN_DROPDOWN.USER);
  };

  const handleThemeToggle = () => {
    setOpenDropdown(openDropdown === OPEN_DROPDOWN.THEME ? null : OPEN_DROPDOWN.THEME);
  };

  return (
    <div className={`${pillStyles.pill} ${baseStyles.card}`} ref={pillRef}>
      <ThemeSelector isOpen={openDropdown === OPEN_DROPDOWN.THEME} onToggle={handleThemeToggle} />
      <div className={pillStyles.separator} />
      <div className={pillStyles.userSection}>
        <button className={pillStyles.userButton} onClick={handleUserToggle}>
          {isAuthenticated ? <User size={18} /> : <KeyRound size={18} />}
        </button>

        {openDropdown === OPEN_DROPDOWN.USER && (
          <>
            {isAuthenticated && !authSuccessDelay ? (
              <UserMenu onClose={() => setOpenDropdown(null)} />
            ) : (
              <LoginDropdown onClose={() => setOpenDropdown(null)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
