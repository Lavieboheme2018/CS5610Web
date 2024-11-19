import React from 'react';
import '../styles/FeaturePreview.css';

function FeaturePreview({ pets }) {
  return (
    <div className="feature-preview">
      <h2>Your Pets Medical Reminder</h2>
      <div className="pet-activities">
        {pets.map((pet) => (
          <div key={pet._id} className="pet-card">
            <img src="placeholder.jpg" alt={pet.name} />
            <h3>{pet.name}</h3>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age} years</p>
            <p><strong>Weight:</strong> {pet.weight} kg</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturePreview;
