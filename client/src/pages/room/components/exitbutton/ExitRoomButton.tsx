import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import buttonStyles from '../../../../styles/Buttons.module.css';
import exitButtonStyles from './ExitRoomButton.module.css'

export default function ExitRoomButton() {
  const navigate = useNavigate();

  const handleExitRoom = () => {
    navigate('/');
  };


  return (
    <button
      onClick={handleExitRoom}
      className={`${buttonStyles.button} ${buttonStyles.lightRed} ${buttonStyles.iconButton} 
      ${exitButtonStyles.exitRoomButton}`}
    >
      <ChevronLeft size={24} className={`${buttonStyles.icon} ${exitButtonStyles.chevron}`} />
      Exit
    </button>
  )
}