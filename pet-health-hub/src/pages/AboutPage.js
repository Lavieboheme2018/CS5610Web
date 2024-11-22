import React from 'react';
import '../styles/AboutPage.css';
import Headers from '../components/Header';
import Footer from '../components/Footer';

function AboutPage() {
  return (
    <div className="about-page-wrapper">
      <Headers />
      <div className="about-page">
        <h1>About Us</h1>
        <p>
          Welcome to CritterCare, your one-stop platform for managing your beloved pets' health
          records, appointments, and much more. Our mission is to make pet care easier and more
          accessible for pet owners everywhere.
        </p>
        <h2>Our Vision</h2>
        <p>
          We aim to provide a comprehensive solution for pet owners, ensuring that every pet gets
          the love and care they deserve.
        </p>
        <h2>Our Team</h2>
        <p>
          CritterCare is built by a team of passionate pet lovers and tech enthusiasts, working
          together to create a better experience for pets and their owners.
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default AboutPage;
