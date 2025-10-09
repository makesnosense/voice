import ThemeSelector from './ThemeSelector';

import baseStyles from '../styles/BaseCard.module.css';
import voiceStyles from './Header.module.css';

type VoiceState = 'active' | 'silent' | 'muted';

interface HeaderProps {
  voiceState?: VoiceState;
  leftContent?: React.ReactNode;
}

export default function Header({
  voiceState = 'active',
  leftContent
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
    <header className={`${voiceStyles.headerContainer}`}>

      <div className={voiceStyles.leftSlot}>
        {leftContent}
      </div>

      <div className={`${baseStyles.card} ${voiceStyles.titleCard} ${getVoiceStateClass()}`}>
        <div className={voiceStyles.voiceWaves}>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
          <div className={voiceStyles.wave}></div>
        </div>
        <h1 className={baseStyles.title}>Voice</h1>
      </div>

      <ThemeSelector />

    </header>
  );
}