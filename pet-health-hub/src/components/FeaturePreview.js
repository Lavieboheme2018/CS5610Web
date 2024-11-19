import React from 'react';
import '../styles/FeaturePreview.css';

function FeaturePreview({ isLoggedIn }) {
  return (
    <div className="feature-preview">
      <h2>{isLoggedIn ? 'Recent Pet Activities or Health Records' : 'Example of Pet Activities or Health Records'}</h2>
      <div className="pet-activities">
        {[1, 2, 3].map((pet) => (
          <div key={pet} className="pet-card">
            <img src="placeholder.jpg" alt={`Pet ${pet}`} />
            <h3>Pet {String.fromCharCode(64 + pet)}</h3>
            <div>Health Conditions</div>
            <div>Medications</div>
            <div>Upcoming Reminders</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturePreview;