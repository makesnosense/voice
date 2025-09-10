import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import type { CreateRoomResponse } from '../../../shared/types';
import Header from '../components/Header';
import './LandingPage.css';

export default function LandingPage() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Voice Chat - Landing';
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
    <>
      <Header />
      {/* <h1>📞 Minimal Voice Chat</h1> */}

      <div id="lobby">
        <button onClick={handleCreateRoom}
          disabled={isCreating}
          className="create-room-btn">
          Create Call</button>
        <p>Or enter room URL to join existing call</p>
      </div>
    </>
  );


}