'use client';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MeshLogo from '@/components/MeshLogo';
import { Searchbar } from '@/components/Searchbar';
import NewUserForm from '@/components/NewUserForm';

function App() {
  return (
    <Router>
      <div style={styles.container}>
        <Navbar />
        <div style={styles.header}>
          <MeshLogo />
          <Searchbar />
        </div>
        <div style={styles.formWrapper}>
          <NewUserForm />
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
    position: 'relative', // Needed for positioning child elements absolutely
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
  formWrapper: {
    position: 'absolute',
    top: '20px', // Adjust for desired padding from the top
    right: '20px', // Adjust for desired padding from the right
  },
  pageText: {
    color: 'white',
  },
};
