import headerStyles from './Header.module.css';

export default function HeaderAnimation() {
  return (
    <div className={headerStyles.voiceWaves}>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
      <div className={headerStyles.wave}></div>
    </div>
  )
}