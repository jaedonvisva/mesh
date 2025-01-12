'use client';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MeshLogo from '@/components/MeshLogo';
import { Searchbar } from '@/components/Searchbar';

function App() {
  return (
    <Router>
      <div style={styles.container}>
        <Navbar />
        <div style={styles.header}>
          <MeshLogo />
          <Searchbar />
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<h1 style={styles.pageText}>Home</h1>} />
        <Route path="/search" element={<h1 style={styles.pageText}>Search</h1>} />
        <Route path="/profile" element={<h1 style={styles.pageText}>Profile</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#303d4e', // ✅ Exact color match
    color: 'white',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px',
    backgroundColor: '#303d4e',
    gap: '20px',
  },
  pageText: {
    color: 'white',
  },
};
