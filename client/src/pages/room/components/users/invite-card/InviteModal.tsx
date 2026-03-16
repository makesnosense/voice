import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../../../api';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { ApiError } from '../../../../../../../shared/errors';
import styles from './InviteModal.module.css';
import type { RoomId } from '../../../../../../../shared/types/core';

interface InviteModalProps {
  roomId: RoomId;
  onClose: () => void;
  onInviteSent: (email: string) => void;
}

export default function InviteModal({ roomId, onClose, onInviteSent }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = await getValidAccessToken();
      await api.rooms.inviteToRoom(roomId, email, token);
      onInviteSent(email);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setErrorMessage('no registered device found for this email');
        } else if (error.status === 401) {
          setErrorMessage('you need to be logged in');
        } else {
          setErrorMessage('failed to send call, try again');
        }
      } else {
        setErrorMessage('network error, try again');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>add user to room</span>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
            autoFocus
            required
          />
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          <button type="submit" disabled={isLoading || !email} className={styles.submitButton}>
            {isLoading ? 'calling...' : 'call'}
          </button>
        </form>
      </div>
    </div>
  );
}
