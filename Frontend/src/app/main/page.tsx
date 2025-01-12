'use client';

import Navbar from '@/components/Navbar';
import MeshLogo from '@/components/MeshLogo';
import { Searchbar } from '@/components/Searchbar';
import TinderSwipe from '@/components/TinderSwipe';
import UserCards from '@/components/TinderSwipe';

export default function Main() {
  fetch('https://local_host/api/get-users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data.users) {
        console.log('All users fetched successfully:', data.users);
      } else {
        console.error('Error fetching users:', data.error);
      }
    })
    .catch(error => {
      console.error('Network error:', error);
    });

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.header}>
        <MeshLogo />
        <Searchbar />
      </div>
      <div style={styles.content}>
      <UserCards />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#303d4e',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  }
};