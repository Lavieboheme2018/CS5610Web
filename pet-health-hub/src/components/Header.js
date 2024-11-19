import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>Logo</div>
      <nav>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/about')}>About</button>
        <button onClick={() => navigate('/resources')}>Resources</button>
      </nav>
      <div className="auth-buttons">
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/login')}>Sign Up</button>
      </div>
    </header>
  );
}

export default Header;