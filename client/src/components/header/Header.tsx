import TitleHeader from './title-header/TitleHeader';
import Pill from './pill/Pill';
import headerStyles from './Header.module.css';
import type { HeaderAnimationState } from './title-header/header-animation/HeaderAnimationState';

interface HeaderProps {
  leftContent?: React.ReactNode;
  animationState?: HeaderAnimationState;
}

export default function Header({ leftContent, animationState }: HeaderProps) {
  return (
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>{leftContent}</div>
      <TitleHeader animationState={animationState} />
      <Pill />
    </header>
  );
}
