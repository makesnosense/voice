import { Monitor, Smartphone } from 'lucide-react';
import sessionRowStyles from './SessionRow.module.css';
import { PLATFORM } from '../../../../../../shared/constants/platform';
import RemoveButton from '../../../../components/remove-button/RemoveButton';
import { formatLastSeen } from '../../../../../../shared/utils/format-last-seen';
import type { Device } from '../../../../../../shared/types/devices';

interface SessionRowProps {
  device: Device;
  isCurrentDevice?: boolean;
  isRemoving?: boolean;
  onRemove?: () => void;
}

export default function SessionRow({
  device,
  isCurrentDevice = false,
  isRemoving = false,
  onRemove,
}: SessionRowProps) {
  const Icon = device.platform === PLATFORM.WEB ? Monitor : Smartphone;

  return (
    <div className={sessionRowStyles.row}>
      <div className={sessionRowStyles.icon}>
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <div className={sessionRowStyles.info}>
        <span className={sessionRowStyles.name}>{device.deviceName ?? device.platform}</span>
        <span className={sessionRowStyles.meta}>
          {device.platform} · {formatLastSeen(device.lastSeen)}
        </span>
      </div>
      {isCurrentDevice && <span className={sessionRowStyles.badge}>This device</span>}
      {!isCurrentDevice && (
        <RemoveButton onClick={onRemove!} isRemoving={isRemoving} title="remove session" />
      )}
    </div>
  );
}
