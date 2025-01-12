import React, { useState } from 'react';
import { User } from '../types/User'; // Ensure you have User type defined

interface TinderSwipeProps {
  potentialConnections: User[];
  currentUser: User;
  onAccept: (userId: string) => void;
  onSkip: (userId: string) => void;
}

const TinderSwipe: React.FC<TinderSwipeProps> = ({
  potentialConnections,
  currentUser,
  onAccept,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAccept = () => {
    if (currentIndex < potentialConnections.length) {
      const acceptedUser = potentialConnections[currentIndex];
      onAccept(acceptedUser._id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < potentialConnections.length) {
      const skippedUser = potentialConnections[currentIndex];
      onSkip(skippedUser._id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (currentIndex >= potentialConnections.length) {
    return <div>No more potential connections available!</div>;
  }

  const currentUser = potentialConnections[currentIndex];

  return (
    <div className="tinder-swipe">
      <div className="user-card">
        <h2>{currentUser.name}</h2>
        {/* Add more user details as needed */}
      </div>
      <div className="action-buttons">
        <button 
          onClick={handleSkip}
          className="skip-button"
        >
          Skip
        </button>
        <button 
          onClick={handleAccept}
          className="accept-button"
        >
          Add to Mesh
        </button>
      </div>
    </div>
  );
};

export default TinderSwipe; 