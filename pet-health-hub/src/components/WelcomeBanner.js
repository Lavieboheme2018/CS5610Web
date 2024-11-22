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
        <h1>All Your Pet's Health Record,</h1>
        <h1> in One Place</h1>
        <button onClick={handleButtonClick}>
          {isLoggedIn ? `Welcome, ${userName}!` : 'Get Started!'}
        </button>
      </div>
      <div className="welcome-images">
        <div className="image-container">
          <img src="/example.png" alt="Main example" className="main-image" />
          <img src="/example_pet.png" alt="Pet example" className="overlay-image" />
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;