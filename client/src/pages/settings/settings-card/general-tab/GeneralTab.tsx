import { Link } from 'react-router';
import styles from './GeneralTab.module.css';
import NameField from './name-field/NameField';
import DeleteAccount from './delete-account/DeleteAccount';

export default function GeneralTab() {
  return (
    <div className={styles.container}>
      <span className={styles.fieldLabel}>name</span>
      <NameField />
      <div className={styles.divider} />
      <span className={styles.fieldLabel}>danger zone</span>
      <DeleteAccount />
      <div className={styles.divider} />

      <Link to="/privacy" className={styles.privacyLink}>
        Privacy Policy
      </Link>
    </div>
  );
}
