import baseStyles from '../styles/BaseCard.module.css';
import voiceStyles from './Header.module.css';

type VoiceState = 'active' | 'silent' | 'muted';

interface HeaderProps {
  title?: string;
  voiceState?: VoiceState;
  className?: string;
}

export default function Header({
  title = 'Voice',
  voiceState = 'active',
  className = ''
}: HeaderProps) {

  const getVoiceStateClass = () => {
    switch (voiceState) {
      case 'silent':
        return voiceStyles.silent;
      case 'muted':
        return voiceStyles.muted;
      case 'active':
      default:
        return '';
    }
  };

  return (
    <header className={`${baseStyles.card} ${getVoiceStateClass()} ${className}`}>
      <div className={voiceStyles.voiceIcon}>
        <div className={voiceStyles.voiceWaves}>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
        </div>
      </div>
      <h1 className={baseStyles.title}>{title}</h1>
    </header>
  );
}