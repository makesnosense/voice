import { useState } from 'react';
import baseStyles from '../../../styles/BaseCard.module.css';
import styles from './SettingsCard.module.css';
import GeneralTab from './general-tab/GeneralTab';
import SessionsTab from './sessions-tab/SessionsTab';
import type { ObjectValues } from '../../../../../shared/types/core';

const SETTINGS_TAB = {
  GENERAL: 'general',
  SESSIONS: 'sessions',
} as const;

type SettingsTab = ObjectValues<typeof SETTINGS_TAB>;

export default function SettingsCard() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SETTINGS_TAB.GENERAL);

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${styles.container}`}>
      <div className={styles.header}>
        <span className={baseStyles.title}>Settings</span>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === SETTINGS_TAB.GENERAL ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(SETTINGS_TAB.GENERAL)}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${activeTab === SETTINGS_TAB.SESSIONS ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(SETTINGS_TAB.SESSIONS)}
          >
            Sessions
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === SETTINGS_TAB.GENERAL ? <GeneralTab /> : <SessionsTab />}
      </div>
    </div>
  );
}
