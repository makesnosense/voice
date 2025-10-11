import HeaderAnimation from './HeaderAnimation';
import baseStyles from '../styles/BaseCard.module.css';
import headerStyles from './Header.module.css';

import type { HeaderAnimationState } from './HeaderAnimationState';

interface TitleHeaderProps {
  animationState?: HeaderAnimationState;
}

export default function TitleHeader({
  animationState
}: TitleHeaderProps) {

  return (
    <div className={`${baseStyles.card} ${headerStyles.titleCard}`}>
      <HeaderAnimation animationState={animationState} />
      <h1 className={baseStyles.title}>Voice</h1>
    </div>
  )

}