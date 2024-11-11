import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="logo">Logo</div>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
        <a href="/resources">Resources</a>
      </nav>
      <div className="social-media">
        <a href="#">FB</a>
        <a href="#">LI</a>
        <a href="#">IG</a>
      </div>
    </footer>
  );
}

export default Footer;