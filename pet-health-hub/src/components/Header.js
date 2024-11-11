import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">Logo</div>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
        <a href="/resources">Resources</a>
      </nav>
      <div className="auth-buttons">
        <button>Log In</button>
        <button>Sign Up</button>
      </div>
    </header>
  );
}

export default Header;