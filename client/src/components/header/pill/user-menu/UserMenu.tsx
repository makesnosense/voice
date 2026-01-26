import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import baseStyles from '../../../../styles/BaseCard.module.css';
import userMenuStyles from './UserMenu.module.css';

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handlePreferences = () => {
    // TODO: implement user preferences modal
    console.log('user preferences clicked');
  };

  return (
    <div className={`${userMenuStyles.dropdown} ${baseStyles.card}`}>
      <div className={userMenuStyles.header}>
        <span className={userMenuStyles.email}>{user?.email}</span>
      </div>

      <div className={userMenuStyles.divider} />

      <div className={userMenuStyles.actions}>
        <button className={userMenuStyles.menuButton} onClick={handlePreferences}>
          <Settings size={16} />
          <span className={userMenuStyles.menuButtonText}>Settings</span>
        </button>

        <button
          className={`${userMenuStyles.menuButton} ${userMenuStyles.logout}`}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
