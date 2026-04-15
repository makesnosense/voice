import Header from '../../components/header/Header';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import layoutStyles from '../../styles/Layout.module.css';
import styles from './SettingsPage.module.css';
import SettingsCard from './settings-card/SettingsCard';

const backButton = <BackButton label="Back" variant={BACK_BUTTON_VARIANT.NEUTRAL} />;

export default function SettingsPage() {
  return (
    <div className={layoutStyles.page}>
      <Header leftSlot={backButton} />
      <main className={styles.content}>
        <SettingsCard />
      </main>
    </div>
  );
}
