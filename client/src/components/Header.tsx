import styles from './Header.module.css';

type VoiceState = 'active' | 'silent' | 'muted';

interface HeaderProps {
  title?: string;
  voiceState?: VoiceState;
  className?: string;
}

export default function Header({
  title = 'Voice',
  voiceState = 'silent',
  className = ''
}: HeaderProps) {
  const getStateClass = () => {
    switch (voiceState) {
      case 'silent':
        return styles.silent;
      case 'muted':
        return styles.muted;
      case 'active':
      default:
        return '';
    }
  };

  return (
    <header className={`${styles.voiceHeader} ${getStateClass()} ${className}`}>
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
}