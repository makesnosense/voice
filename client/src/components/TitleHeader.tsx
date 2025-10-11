import HeaderAnimation from './HeaderAnimation';
import baseStyles from '../styles/BaseCard.module.css';
import headerStyles from './Header.module.css';
import { HEADER_ANIMATION_STATE } from './HeaderAnimationState';
import type { HeaderAnimationState } from './HeaderAnimationState';

interface TitleHeaderProps {
  animationState?: HeaderAnimationState;
}

export default function TitleHeader({
  animationState = HEADER_ANIMATION_STATE.ACTIVE
}: TitleHeaderProps) {
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
    <div className={`${baseStyles.card} ${headerStyles.titleCard} ${getAnimationStateClass()}`}>
      <HeaderAnimation />
      <h1 className={baseStyles.title}>Voice</h1>
    </div>
  )

}