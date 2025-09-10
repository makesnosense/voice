import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function RoomError() {
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

  return (
    <>
      <h1>❌ Room does not exist</h1>
      <div className="error">
        <p>Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
        <button onClick={() => navigate('/')}>Go Home Now</button>
      </div>
    </>
  );
}