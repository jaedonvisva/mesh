// components/UserMatchingCards.tsx

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, X } from 'lucide-react';

interface User {
  _id?: string;
  id?: string;
  name: string;
  age?: number;
  skills?: string[];
  interests?: string[];
  background?: string;
  connections?: string[];
  photo?: string; // Added for displaying user images
  bio?: string;   // Added for user biography
}

/* Styled Components */

/* Container for different states */
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #303d4e;
  padding: 20px;
`;

/* Button Styles */
const Button = styled.button<{ variant?: string }>`
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'orange':
        return '#f97316'; // Orange-500
      case 'red':
        return '#dc2626'; // Red-600
      case 'green':
        return '#16a34a'; // Green-600
      case 'gray':
        return '#6b7280'; // Gray-500
      case 'blue':
        return '#3b82f6'; // Blue-500
      default:
        return '#f97316'; // Default to Orange-500
    }
  }};
  color: #ffffff;
  font-weight: 600;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'orange':
          return '#ea580c'; // Orange-600
        case 'red':
          return '#b91c1c'; // Red-700
        case 'green':
          return '#15803d'; // Green-700
        case 'gray':
          return '#4b5563'; // Gray-600
        case 'blue':
          return '#2563eb'; // Blue-600
        default:
          return '#ea580c'; // Default to Orange-600
      }
    }};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }
`;

/* Spinner Animation */
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* Spinner Styles */
const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f97316; /* Orange-500 */
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: ${spin} 1s linear infinite;
`;

/* Error Message Styles */
const ErrorMessage = styled.div`
  max-width: 400px;
  padding: 20px;
  background-color: #b91c1c; /* Red-700 */
  color: #ffffff;
  border: 2px solid #991b1b; /* Red-900 */
  border-radius: 8px;
  text-align: center;
`;

/* Message Styles */
const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
`;

/* Profile Card Styles */
const ProfileCard = styled.div`
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
  width: 100%;
  max-width: 400px;
  color: #ffffff;
`;

/* Profile Name */
const ProfileName = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

/* Profile Details */
const ProfileDetail = styled.p`
  color: #d1d5db; /* Gray-300 */
  margin-bottom: 10px;
`;

/* Section Title */
const SectionTitle = styled.p`
  font-weight: 600;
  margin-bottom: 5px;
`;

/* Tags Container */
const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

/* Individual Tag */
const Tag = styled.span<{ color: string }>`
  background-color: ${({ color }) => color};
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.875rem;
`;

/* Action Buttons Container */
const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

/* Individual Action Button */
const ActionButton = styled.button<{ color: string }>`
  background-color: ${({ color }) => color};
  color: #ffffff;
  padding: 16px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    opacity: 0.9;
  }

  &:focus {
    outline: none;
  }
`;

/* Reset Connections Button Container */
const ResetContainer = styled.div`
  text-align: center;
  margin-top: 30px;
`;

/* Main Component */
const UserMatchingCards: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const handleResetConnections = async () => {
    if (!currentUser?._id) return;

    try {
      const response = await fetch('http://localhost:5000/api/reset-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset connections');
      }

      // Reset local state
      setCurrentUser(prev => prev ? { ...prev, connections: [] } : null);
      setCurrentIndex(0);
      // Refresh the users list
      handleStartMatching();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset connections');
    }
  };

  const handleStartMatching = async () => {
    setIsStarted(true);
    setLoading(true);
    setError(null);

    try {
      // First get current user
      const currentUserResponse = await fetch('http://localhost:5000/api/current-user');
      const currentUserData = await currentUserResponse.json();

      if (!currentUserResponse.ok) {
        throw new Error(currentUserData.error || 'Failed to fetch current user');
      }

      if (!currentUserData.user?._id) {
        throw new Error('No user ID found');
      }

      setCurrentUser(currentUserData.user);

      // Then get all other users
      const usersResponse = await fetch('http://localhost:5000/api/get-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_user_id: currentUserData.user._id,
          connections: currentUserData.user.connections || [],
        }),
      });

      const usersData = await usersResponse.json();

      if (!usersResponse.ok) {
        throw new Error(usersData.error || 'Failed to fetch users');
      }

      setUsers(usersData.users || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting matching');
      setIsStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConnection = async (userId: string, accept: boolean) => {
    if (!currentUser?._id) return;

    try {
      const response = await fetch('http://localhost:5000/api/update-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_user_id: currentUser._id,
          target_user_id: userId,
          accept,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update connection');
      }

      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
    }
  };

  /* Render Different States */

  if (!isStarted) {
    return (
      <Container style={{ backgroundColor: '#303d4e' }}>
        <Button variant="orange" onClick={handleStartMatching}>
          Start Matching
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container style={{ backgroundColor: '#1f2937' }}>
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <p>Error: {error}</p>
          <Button variant="red" onClick={() => { setError(null); setIsStarted(false); }}>
            Try Again
          </Button>
        </ErrorMessage>
      </Container>
    );
  }

  if (users.length === 0) {
    return (
      <Container style={{ backgroundColor: '#303d4e' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Message>No profiles available!</Message>
          <Button variant="orange" onClick={handleStartMatching}>
            Refresh
          </Button>
        </div>
      </Container>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <Container style={{ backgroundColor: '#e88c51' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Message>No more profiles to show!</Message>
          <Button variant="orange" onClick={() => { setCurrentIndex(0); handleStartMatching(); }}>
            Start Over
          </Button>
        </div>
      </Container>
    );
  }

  const currentProfile = users[currentIndex];

  return (
    <Container style={{ backgroundColor: '#1f2937', flexDirection: 'column' }}>
      <ProfileCard>
        <ProfileName>{currentProfile.name}</ProfileName>
        {currentProfile.age && (
          <ProfileDetail>Age: {currentProfile.age}</ProfileDetail>
        )}
        {currentProfile.bio && (
          <ProfileDetail>{currentProfile.bio}</ProfileDetail>
        )}
        {currentProfile.skills && currentProfile.skills.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <SectionTitle>Skills:</SectionTitle>
            <Tags>
              {currentProfile.skills.map((skill, index) => (
                <Tag key={index} color="#2563eb"> {/* Blue-600 */}
                  {skill}
                </Tag>
              ))}
            </Tags>
          </div>
        )}
        {currentProfile.interests && currentProfile.interests.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <SectionTitle>Interests:</SectionTitle>
            <Tags>
              {currentProfile.interests.map((interest, index) => (
                <Tag key={index} color="#16a34a"> {/* Green-600 */}
                  {interest}
                </Tag>
              ))}
            </Tags>
          </div>
        )}
        {currentProfile.background && (
          <div style={{ marginTop: '15px' }}>
            <SectionTitle>Background:</SectionTitle>
            <ProfileDetail>{currentProfile.background}</ProfileDetail>
          </div>
        )}
      </ProfileCard>

      <ActionButtons>
        <ActionButton
          color="#dc2626" // Red-600
          onClick={() => handleUpdateConnection(currentProfile._id || '', false)}
          aria-label="Reject"
        >
          <X size={24} />
        </ActionButton>
        <ActionButton
          color="#16a34a" // Green-600
          onClick={() => handleUpdateConnection(currentProfile._id || '', true)}
          aria-label="Accept"
        >
          <Check size={24} />
        </ActionButton>
      </ActionButtons>

      <ResetContainer>
        <Button variant="gray" onClick={handleResetConnections}>
          Reset Connections
        </Button>
      </ResetContainer>
    </Container>
  );
};

export default UserMatchingCards;
