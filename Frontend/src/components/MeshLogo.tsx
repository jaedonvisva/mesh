import React from 'react';

const MeshLogo = () => {
  return (
    <div style={styles.container}>
      <div style={styles.logoPlaceholder}>
      {/* <img src="/logo3-modified.png" alt="Mesh Logo"></img> */}
      </div>
      <h1 style={styles.title}>Mesh</h1>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#303d4e',
  },
  logoPlaceholder: {
    width: '60px',
    height: '60px',
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#303d4e',
    marginRight: '15px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #dc4174, #e88c51, #f4c84c)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
};

export default MeshLogo;
