import { HEADER_ANIMATION_STATE } from './HeaderAnimationState';
import headerStyles from './Header.module.css';
import type { HeaderAnimationState } from './HeaderAnimationState';

interface HeaderAnimationProps {
  animationState?: HeaderAnimationState;
}

export default function HeaderAnimation({
  animationState = HEADER_ANIMATION_STATE.ACTIVE
}: HeaderAnimationProps
) {
  const getAnimationStateClass = () => {
    switch (animationState) {
      case HEADER_ANIMATION_STATE.SILENT:
        return headerStyles.silent;
      case HEADER_ANIMATION_STATE.MUTED:
        return headerStyles.muted;
      case HEADER_ANIMATION_STATE.ACTIVE:
      default:
        return '';
    }
  };

  return (
    <div className={`${headerStyles.voiceWaves} ${getAnimationStateClass()}`}>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
    </div>
  )
}