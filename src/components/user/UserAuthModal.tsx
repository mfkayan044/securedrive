import React, { useState } from 'react';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) return null;

  return (
    <>
      {mode === 'login' ? (
        <UserLogin
          onClose={onClose}
          onSwitchToRegister={() => setMode('register')}
        />
      ) : (
        <UserRegister
          onClose={onClose}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </>
  );
};

export default UserAuthModal;