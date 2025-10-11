import TitleHeader from './TitleHeader';
import ThemeSelector from './theme-selector/ThemeSelector';
import headerStyles from './Header.module.css';
import type { HeaderAnimationState } from './header-animation/HeaderAnimationState';

interface HeaderProps {
  leftContent?: React.ReactNode;
  animationState?: HeaderAnimationState;
}

export default function Header({
  leftContent,
  animationState
}: HeaderProps) {
  return (
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>{leftContent}</div>
      <TitleHeader animationState={animationState} />
      <ThemeSelector />
    </header>
  );
}
