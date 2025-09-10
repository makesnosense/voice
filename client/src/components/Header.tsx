
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  animated?: boolean;
  className?: string;
}

export default function Header({
  title = 'Voice',
  animated = true,
  className = ''
}: HeaderProps) {
  return (
    <header className={`${styles.voiceHeader} ${!animated ? styles.static : ''} ${className}`}>
      <div className={styles.voiceIcon}>
        <div className={styles.voiceWaves}>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
        </div>
      </div>
      <h1 className={styles.voiceTitle}>{title}</h1>
    </header>
  );
};
