import React, { useContext, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeaturePreview from '../components/FeaturePreview';
import WelcomeBanner from '../components/WelcomeBanner';
import { UserContext } from '../context/UserContext';
import '../styles/HomePage.css';

const HomePage = () => {
  const { user } = useContext(UserContext);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (!user) return; // 如果未登录，不进行宠物数据的获取

    const fetchUserPets = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/api/pets/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }

        const petsData = await response.json();
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching pets:', error.message);
      }
    };

    fetchUserPets();
  }, [user]);

  return (
    <div className="homepage">
      <Header />
      <WelcomeBanner isLoggedIn={!!user} userName={user?.email || ''} />
      {user && pets.length > 0 && <FeaturePreview pets={pets} />} {/* 仅登录时显示宠物数据 */}
      <Footer />
    </div>
  );
};

export default HomePage;
