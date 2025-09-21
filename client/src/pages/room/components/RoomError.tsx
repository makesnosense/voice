import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import baseStyles from '../../../styles/BaseCard.module.css';
import buttonStyles from '../../../styles/Buttons.module.css';

interface RoomErrorProps {
  errorType?: 'not-found' | 'room-full';
}

export default function RoomError({ errorType = 'not-found' }: RoomErrorProps) {
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
    switch (errorType) {
      case 'room-full':
        return {
          icon: '🚫',
          title: 'Room is full',
          description: 'This room already has 2 people (maximum capacity).'
        };
      case 'not-found':
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
    <div style={{
      width: '100%',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '2rem' }}>
          {icon}
        </div>
        <h1 className={baseStyles.title}>{title}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ color: '#64748b', margin: 0 }}>
          {description}
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
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