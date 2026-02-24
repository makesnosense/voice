import micWarningStyles from './MicWarning.module.css';
import { MIC_PERMISSION_STATUS } from '../../../../../../shared/constants/microphone';
import type { MicErrorStatus } from '../../../../stores/useMicrophoneStore';

interface MicWarningProps {
  micPermissionStatus: MicErrorStatus;
}

export default function MicWarning({ micPermissionStatus }: MicWarningProps) {
  return (
    <div className={micWarningStyles.micWarning}>
      {micPermissionStatus === MIC_PERMISSION_STATUS.DENIED
        ? '⚠️ Microphone permission denied. Please enable it in browser settings.'
        : "⚠️ Your browser doesn't support audio input."}
    </div>
  );
}
