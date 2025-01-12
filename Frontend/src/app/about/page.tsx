'use client'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Navbar'; // Import your Navbar

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/search" element={<h1>Search</h1>} />
        <Route path="/profile" element={<h1>Profile</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
