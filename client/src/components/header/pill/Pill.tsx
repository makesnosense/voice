import ThemeSelector from '../theme-selector/ThemeSelector';
import { User } from 'lucide-react';
import baseStyles from '../../../styles/BaseCard.module.css';
import styles from './Pill.module.css';

export default function Pill() {
  const handleAuthClick = () => {
    console.log('auth clicked');
  };

  return (
    <div className={`${styles.pill} ${baseStyles.card}`}>
      <ThemeSelector />
      <div className={styles.separator} />
      <button className={styles.authButton} onClick={handleAuthClick}>
        <User size={18} />
      </button>
    </div>
  );
}
