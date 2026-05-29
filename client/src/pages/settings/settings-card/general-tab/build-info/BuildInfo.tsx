import { useState, useEffect } from 'react';
import { formatDeployedAt } from '../../../../../../../shared/utils/format';
import styles from './BuildInfo.module.css';

interface VersionInfo {
  commit: string | null;
  deployedAt: string | null;
}

export default function BuildInfo() {
  const [version, setVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch('/version')
      .then((res) => res.json())
      .then((data) => {
        console.log('Version response:', data);
        setVersion(data);
      })
      .catch((err) => console.error('Version fetch failed:', err));
  }, []);

  if (!version?.commit) return null;

  return (
    <span className={styles.buildInfo}>
      <span className={styles.buildLabel}>build</span>
      <span
        className={styles.buildHash}
        data-date={version.deployedAt ? formatDeployedAt(version.deployedAt) : undefined}
      >
        {version.commit}
      </span>
    </span>
  );
}
