import './App.css';
import React, { useState } from 'react';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import FeaturePreview from './components/FeaturePreview';
import Footer from './components/Footer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userName = "User"; // Placeholder

  return (
    <div className="App">
      <Header />
      <WelcomeBanner isLoggedIn={isLoggedIn} userName={userName} />
      <FeaturePreview isLoggedIn={isLoggedIn} />
      <Footer />
    </div>
  );
}

export default App;
