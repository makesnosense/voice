import styles from './GeneralTab.module.css';
import NameField from './name-field/NameField';

export default function GeneralTab() {
  return (
    <div className={styles.container}>
      <span className={styles.fieldLabel}>name</span>
      <NameField />
    </div>
  );
}
