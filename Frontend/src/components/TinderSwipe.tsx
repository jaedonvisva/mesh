// components/UserMatchingCards.tsx

import React, { useState } from 'react';
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

const UserMatchingCards = () => {
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

  if (!isStarted) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gray-900">
        <button
          onClick={handleStartMatching}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors transform hover:scale-105 shadow-lg"
        >
          Start Matching
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-red-700 text-white border border-red-900 rounded-lg">
        <p className="mb-4">Error: {error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsStarted(false);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors transform hover:scale-105 shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 bg-gray-900 text-white">
        <p className="text-xl font-semibold">No profiles available!</p>
        <button
          onClick={handleStartMatching}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors transform hover:scale-105 shadow"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 bg-gray-900 text-white">
        <p className="text-xl font-semibold">No more profiles to show!</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            handleStartMatching();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors transform hover:scale-105 shadow"
        >
          Start Over
        </button>
      </div>
    );
  }

  const currentProfile = users[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-transparent backdrop-filter backdrop-blur-lg bg-opacity-30 rounded-lg shadow-lg overflow-hidden transition-all duration-500">
          {currentProfile.photo ? (
            <img
              src={currentProfile.photo}
              alt={currentProfile.name}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="w-full h-72 bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300">No Image Available</span>
            </div>
          )}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white">{currentProfile.name}</h3>
            {currentProfile.age && (
              <p className="text-gray-300 mt-2">Age: {currentProfile.age}</p>
            )}
            {currentProfile.bio && (
              <p className="text-gray-300 mt-4">{currentProfile.bio}</p>
            )}
            {currentProfile.skills && currentProfile.skills.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-white">Skills:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-white">Interests:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentProfile.background && (
              <div className="mt-4">
                <p className="font-semibold text-white">Background:</p>
                <p className="text-gray-300 mt-2">{currentProfile.background}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => handleUpdateConnection(currentProfile._id || '', false)}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-transform transform hover:scale-110 shadow-lg focus:outline-none"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => handleUpdateConnection(currentProfile._id || '', true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-transform transform hover:scale-110 shadow-lg focus:outline-none"
          >
            <Check size={24} />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleResetConnections}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors transform hover:scale-105 shadow-md"
        >
          Reset Connections
        </button>
      </div>
    </div>
  );
};

export default UserMatchingCards;
