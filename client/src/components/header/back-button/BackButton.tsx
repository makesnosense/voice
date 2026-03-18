import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import buttonStyles from '../../../styles/Buttons.module.css';
import backButtonStyles from './BackButton.module.css';
import { BACK_BUTTON_VARIANT, type BackButtonVariant } from './BackButton.constants';

interface BackButtonProps {
  label: string;
  variant: BackButtonVariant;
  to?: string;
}

export default function BackButton({ label, variant, to }: BackButtonProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  return (
    <button
      onClick={handleBack}
      className={`${buttonStyles.button} ${variant === BACK_BUTTON_VARIANT.RED ? buttonStyles.lightRed : buttonStyles.neutral} ${buttonStyles.iconButton} ${backButtonStyles.backButton}`}
    >
      <ChevronLeft size={24} className={`${buttonStyles.icon} ${backButtonStyles.chevron}`} />
      {label}
    </button>
  );
}
