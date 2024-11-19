import React, { useContext } from 'react';
import Header from '../components/Header';
import WelcomeBanner from '../components/WelcomeBanner';
import FeaturePreview from '../components/FeaturePreview';
import Footer from '../components/Footer';
import { UserContext } from '../context/UserContext';
import '../styles/HomePage.css';

const HomePage = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="homepage">
      <Header />
      <WelcomeBanner isLoggedIn={!!user} userName={user?.name || ''} />
      <FeaturePreview isLoggedIn={!!user} />
      <Footer />
    </div>
  );
};

export default HomePage;