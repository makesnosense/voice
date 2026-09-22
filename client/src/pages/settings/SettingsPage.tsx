import Header from '../../components/header/Header';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import AppError from '../../components/app-error/AppError';
import { APP_ERROR } from '../../components/app-error/AppError.constants';
import { useAuthStore } from '../../stores/useAuthStore';
import layoutStyles from '../../styles/Layout.module.css';
import styles from './SettingsPage.module.css';
import SettingsCard from './settings-card/SettingsCard';

const backButton = <BackButton label="Back" variant={BACK_BUTTON_VARIANT.NEUTRAL} />;

export default function SettingsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  return (
    <div className={layoutStyles.page}>
      <Header leftSlot={backButton} />
      {!isInitializing && !isAuthenticated ? (
        <AppError error={APP_ERROR.UNAUTHORIZED} />
      ) : (
        <main className={styles.content}>
          <SettingsCard />
        </main>
      )}
    </div>
  );
}
