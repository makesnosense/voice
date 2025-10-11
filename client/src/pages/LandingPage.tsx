import buttonStyles from '../styles/Buttons.module.css';
import layoutStyles from '../styles/Layout.module.css';
import { Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import type { CreateRoomResponse } from '../../../shared/types';
import Header from '../components/header/Header';

export default function LandingPage() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Voice';
  }, []);

  const handleCreateRoom = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const { data } = await axios.post<CreateRoomResponse>('/api/create-room');
      console.log('🏠 Created room:', data.roomId);
      navigate(`/${data.roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={layoutStyles.page}>
      <div className={layoutStyles.header}>
        <Header />
      </div>


      <main className={`${layoutStyles.content} ${layoutStyles.landingContent}`}>
        <button onClick={handleCreateRoom}
          disabled={isCreating}
          className={`${buttonStyles.button} ${buttonStyles.lightGreen}`}>
          <Phone size={20} className={buttonStyles.icon} />
          Create Call
        </button>
      </main>
    </div >
  );


}