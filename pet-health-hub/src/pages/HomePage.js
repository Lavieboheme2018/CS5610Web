import React, { useContext } from 'react';
import Header from '../components/Header';
import WelcomeBanner from '../components/WelcomeBanner';
import FeaturePreview from '../components/FeaturePreview';
import Footer from '../components/Footer';
import { UserContext } from '../context/UserContext';
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';


const HomePage = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="homepage">
      <Header />
      <WelcomeBanner isLoggedIn={!!user} userName={user?.username || ''} />
      <FeaturePreview isLoggedIn={!!user} />
      
      <div className="resources-link">
        <Link to="/resources">Check out Resources</Link>
      </div>
        
      <Footer />
    </div>
  );
};

export default HomePage;