import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FeaturePreview.css';

const FeaturePreview = ({ isLoggedIn }) => {
  const [pets, setPets] = useState([]);
  const [petImages, setPetImages] = useState({});
  const navigate = useNavigate();

  const examplePets = [
    {
      id: 1,
      name: 'Max',
      breed: 'Golden Retriever',
      age: 5,
      imageUrl: 'example_pet1.png',
    },
    {
      id: 2,
      name: 'Bella',
      breed: 'Persian Cat',
      age: 3,
      imageUrl: 'example_pet2.png',
    },
    {
      id: 3,
      name: 'Charlie',
      breed: 'Beagle',
      age: 4,
      imageUrl: 'example_pet3.png',
    },
    {
      id: 4,
      name: 'Luna',
      breed: 'Husky',
      age: 4,
      imageUrl: 'example_pet4.png',
    },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserPets();
    }
  }, [isLoggedIn]);

  const fetchPetImage = async (petId, filename) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://pet-health-hub-backend.onrender.com/api/pets/image/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPetImages(prev => ({
          ...prev,
          [petId]: imageUrl,
        }));
      }
    } catch (error) {
      console.error(`Error fetching pet image for pet ${petId}:`, error);
    }
  };

  const fetchUserPets = async () => {
    try {
      const response = await fetch('https://pet-health-hub-backend.onrender.com/api/pets/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);

        // Fetch images for pets with profile images
        data.forEach(pet => {
          if (pet.profileImage?.filename) {
            fetchPetImage(pet._id, pet.profileImage.filename);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const renderDemoPets = () =>
    examplePets.map(pet => (
      <div key={pet.id} className="pet-card">
        <div className="pet-avatar">
          <img src={pet.imageUrl} alt={pet.name} />
        </div>
        <h3>{pet.name}</h3>
        <p>
          <strong>Breed:</strong> {pet.breed}
        </p>
        <p>
          <strong>Age:</strong> {pet.age} years
        </p>
        <button disabled>View Details</button>
      </div>
    ));

  const renderUserPets = () =>
    pets.map(pet => (
      <div key={pet._id} className="pet-card">
        <div className="pet-avatar">
          {petImages[pet._id] ? (
            <img src={petImages[pet._id]} alt={pet.name} />
          ) : (
            <div className="pet-avatar-placeholder">
              {pet.name ? pet.name[0].toUpperCase() : 'P'}
            </div>
          )}
        </div>
        <h3>{pet.name}</h3>
        <p>
          <strong>Breed:</strong> {pet.breed}
        </p>
        <p>
          <strong>Age:</strong> {pet.age} years
        </p>
        <button onClick={() => navigate(`/details/${pet._id}`)}>View Details</button>
      </div>
    ));

  return (
    <div className="feature-preview">
      <h2>{isLoggedIn ? 'Your Pets' : 'Preview Examples'}</h2>
      <div className="pets-list">
        {isLoggedIn ? renderUserPets() : renderDemoPets()}
      </div>
    </div>
  );
};

export default FeaturePreview;
