import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomeBanner.css';

function WelcomeBanner({ isLoggedIn, userName }) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (!isLoggedIn) {
      navigate('/login'); // Navigate to the login page if not logged in
    }
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h1>All Your Pet's Health Record, <br /> in One Place</h1>
        <button onClick={handleButtonClick}>
          {isLoggedIn ? `Welcome, ${userName}!` : 'Get Started!'}
        </button>
      </div>
      <div className="welcome-image">
        <div className="image-container">
          <div className="main-image">
            <p>Screenshot of website here</p>
          </div>
          <div className="overlay-image">
            <p>Screenshot of website here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;