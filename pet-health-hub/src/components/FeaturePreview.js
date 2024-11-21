import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FeaturePreview.css';

const FeaturePreview = ({ isLoggedIn }) => {
  const [pets, setPets] = useState([]);
  const [petImages, setPetImages] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserPets();
    }
  }, [isLoggedIn]);

  const fetchPetImage = async (petId, filename) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3001/api/pets/image/${filename}`,
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
          [petId]: imageUrl
        }));
      }
    } catch (error) {
      console.error(`Error fetching pet image for pet ${petId}:`, error);
    }
  };

  const fetchUserPets = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pets/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  const renderDemoPets = () => (
    Array(3).fill(null).map((_, index) => (
      <div key={index} className="pet-card">
        <div className="pet-avatar">
          <div className="pet-avatar-placeholder">
            {String.fromCharCode(65 + index)}
          </div>
        </div>
        <h3>Demo Pet {String.fromCharCode(65 + index)}</h3>
        <p><strong>Breed:</strong> Sample Breed</p>
        <p><strong>Age:</strong> 3 years</p>
        <button disabled>View Details</button>
      </div>
    ))
  );

  const renderUserPets = () => (
    pets.map(pet => (
      <div key={pet._id} className="pet-card">
        <div className="pet-avatar">
          {petImages[pet._id] ? (
            <img 
              src={petImages[pet._id]}
              alt={pet.name}
            />
          ) : (
            <div className="pet-avatar-placeholder">
              {pet.name ? pet.name[0].toUpperCase() : 'P'}
            </div>
          )}
        </div>
        <h3>{pet.name}</h3>
        <p><strong>Breed:</strong> {pet.breed}</p>
        <p><strong>Age:</strong> {pet.age} years</p>
        <button onClick={() => navigate(`/details/${pet._id}`)}>View Details</button>
      </div>
    ))
  );

  return (
    <div className="feature-preview">
      <h2>
        {isLoggedIn ? 'Your Pets' : 'Example Pets'}
      </h2>
      <div className="pets-list">
        {isLoggedIn ? renderUserPets() : renderDemoPets()}
      </div>
    </div>
  );
};

export default FeaturePreview;