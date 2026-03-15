import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import baseStyles from '../../styles/BaseCard.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import roomErrorStyles from './AppError.module.css';
import { APP_ERROR, type AppErrorType } from './AppError.constants';

interface AppErrorProps {
  error: AppErrorType;
}

const ERROR_CONTENT: Record<AppErrorType, { icon: string; title: string; description: string }> = {
  [APP_ERROR.ROOM_NOT_FOUND]: {
    icon: '❌',
    title: 'Room does not exist',
    description: "The room you're looking for could not be found.",
  },
  [APP_ERROR.ROOM_FULL]: {
    icon: '🚫',
    title: 'Room is full',
    description: 'This room already has 2 people (maximum capacity).',
  },
  [APP_ERROR.UNAUTHORIZED]: {
    icon: '🔒',
    title: 'Not logged in',
    description: 'You need to be logged in to view this page.',
  },
};

export default function AppError({ error }: AppErrorProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/');
    }
  }, [countdown, navigate]);

  const { icon, title, description } = ERROR_CONTENT[error];

  return (
    <div className={roomErrorStyles.container}>
      <div className={roomErrorStyles.header}>
        <div className={roomErrorStyles.icon}>{icon}</div>
        <h1 className={baseStyles.title}>{title}</h1>
      </div>

      <div className={roomErrorStyles.messageSection}>
        <p className={roomErrorStyles.description}>{description}</p>
        <p className={roomErrorStyles.countdown}>
          Redirecting to home page in {countdown} second
          {countdown !== 1 ? 's' : ''}...
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className={`${buttonStyles.button} ${buttonStyles.neutral}`}
      >
        Go Home Now
      </button>
    </div>
  );
}
