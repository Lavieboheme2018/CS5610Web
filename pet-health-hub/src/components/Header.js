import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../styles/Header.css';

function Header() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>Logo</div>
      <nav>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/about')}>About</button>
        <button onClick={() => navigate('/resources')}>Resources</button>
        {user ? (
          <>
            <button onClick={() => navigate('/profile')}>Profile</button>
            <button onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Log In</button>
            <button onClick={() => navigate('/login')}>Sign Up</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
