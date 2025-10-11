import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import baseStyles from '../../../styles/BaseCard.module.css';
import buttonStyles from '../../../styles/Buttons.module.css';
import roomErrorStyles from './RoomError.module.css';
import { CONNECTION_STATUS } from '../RoomPage.constants';
import type { ConnectionError } from '../RoomPage.constants';

interface RoomErrorProps {
  connectionError: ConnectionError
}

export default function RoomError({ connectionError }: RoomErrorProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/');
    }
  }, [countdown, navigate]);

  const getErrorMessage = () => {
    switch (connectionError) {
      case CONNECTION_STATUS.ROOM_FULL:
        return {
          icon: '🚫',
          title: 'Room is full',
          description: 'This room already has 2 people (maximum capacity).'
        };
      case CONNECTION_STATUS.ERROR:
      default:
        return {
          icon: '❌',
          title: 'Room does not exist',
          description: 'The room you\'re looking for could not be found.'
        };
    }
  };

  const { icon, title, description } = getErrorMessage();

  return (
    <div className={roomErrorStyles.container}>
      <div className={roomErrorStyles.header}>
        <div className={roomErrorStyles.icon}>
          {icon}
        </div>
        <h1 className={baseStyles.title}>{title}</h1>
      </div>

      <div className={roomErrorStyles.messageSection}>
        <p className={roomErrorStyles.description}>
          {description}
        </p>
        <p className={roomErrorStyles.countdown}>
          Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
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
