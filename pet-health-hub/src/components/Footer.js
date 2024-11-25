import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { FaGithub } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="logo">Critter<span>Care</span></div>
      <nav>
        <Link to="/">Home</Link> 
        <Link to="/about">About</Link>
      </nav>
      <div className="github-link">
        <a
          href="https://github.com/Lavieboheme2018/CS5610Web.git"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
        >
          <FaGithub size={30} style={{ color: '#f5f5f5' }} />
        </a>
      </div>
      <div className="footer-logo"></div>
    </footer>
  );
}

export default Footer;
