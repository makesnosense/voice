import { useState } from 'react';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { api } from '../../../../../api';
import styles from './ExportData.module.css';

export default function ExportData() {
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const accessToken = await getValidAccessToken();
      const data = await api.users.exportData(accessToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'voice-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.card}>
      <span className={styles.message}>Download a copy of your data.</span>
      <button className={styles.exportButton} onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export data'}
      </button>
    </div>
  );
}
