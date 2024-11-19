import React from 'react';
import '../styles/WelcomeBanner.css';

function WelcomeBanner({ isLoggedIn, userName }) {
  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h1>All Your Pet's Health Records, In One Place</h1>
        <button>{isLoggedIn ? `Welcome, ${userName}` : 'Get Started!'}</button>
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
