import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

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
    <>
      <h1>{icon} {title}</h1>
      <div className="error">
        <p>{description}</p>
        <p>Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
        <button onClick={() => navigate('/')}>Go Home Now</button>
      </div>
    </>
  );
}