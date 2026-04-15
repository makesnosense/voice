import { Link } from 'react-router';
import { Settings, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import baseStyles from '../../../../styles/BaseCard.module.css';
import userMenuStyles from './UserMenu.module.css';

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className={`${userMenuStyles.dropdown} ${baseStyles.card}`}>
      <div className={userMenuStyles.header}>
        <span className={userMenuStyles.email}>{user?.email}</span>
      </div>

      <div className={userMenuStyles.divider} />

      <div className={userMenuStyles.actions}>
        <Link
          to="/settings"
          className={`${userMenuStyles.menuButton} ${userMenuStyles.menuLink}`}
          onClick={onClose}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>

        <Link
          to="/contacts"
          className={`${userMenuStyles.menuButton} ${userMenuStyles.menuLink}`}
          onClick={onClose}
        >
          <Users size={16} />
          <span>Contacts</span>
        </Link>

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
