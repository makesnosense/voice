import TitleHeader from './title-header/TitleHeader';
import Pill from './pill/Pill';
import headerStyles from './Header.module.css';
import type { ReactNode } from 'react';

interface HeaderProps {
  leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
  return (
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>{leftSlot}</div>
      <TitleHeader />
      <Pill />
    </header>
  );
}
