// src/pages/HomePage.js
import React from 'react';
import Header from '../components/Header';
import WelcomeBanner from '../components/WelcomeBanner';
import FeaturePreview from '../components/FeaturePreview';
import Footer from '../components/Footer';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />
      <WelcomeBanner />
      <FeaturePreview />
      <Footer />
    </div>
  );
};

export default HomePage;