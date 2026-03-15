import { Search } from 'lucide-react';
import styles from './ContactSearch.module.css';

export default function ContactSearch() {
  return (
    <div className={styles.row}>
      <Search size={14} className={styles.icon} />
      <input type="text" placeholder="Search" className={styles.input} />
    </div>
  );
}
