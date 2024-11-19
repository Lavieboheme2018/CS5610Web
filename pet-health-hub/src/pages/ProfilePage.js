// src/pages/ProfilePage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const pets = [
    { name: 'Buddy', breed: 'Golden Retriever', age: 2, weight: 30, recentVaccination: 'Rabies', recentMedication: 'Antibiotics', recentVetVisit: '10/01/2024', upcomingReminders: 'Next Vaccination: 10/15/2024' },
    { name: 'Max', breed: 'Bulldog', age: 3, weight: 40, recentVaccination: 'DHPP', recentMedication: 'Painkillers', recentVetVisit: '09/25/2024', upcomingReminders: 'Next Checkup: 11/01/2024' },
    { name: 'Luna', breed: 'Siberian Husky', age: 4, weight: 50, recentVaccination: 'Leptospirosis', recentMedication: 'Vitamins', recentVetVisit: '08/20/2024', upcomingReminders: 'Teeth Cleaning: 11/10/2024' }
  ];

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        {/* User Profile Section */}
        <section className="user-profile">
          <h2>User Profile</h2>
          <div className="user-details">
            <div className="user-avatar">
              <div className="avatar-placeholder"></div>
            </div>
            <div className="user-info">
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Name" />
                <button>Update Name</button>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Email" />
                <button>Update Email</button>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="*************" />
                <button>Update Password</button>
              </div>
            </div>
          </div>
        </section>

        {/* Pet's Profile Section */}
        <section className="pets-profile">
          <h2>Pet's Profile</h2>
          <div className="pets-list">
            {pets.map((pet, index) => (
              <div key={index} className="pet-card">
                <div className="pet-avatar">
                  <div className="avatar-placeholder"></div>
                  <p>{pet.name}</p>
                </div>
                <div className="pet-details">
                  <p><strong>Breed:</strong> {pet.breed}</p>
                  <p><strong>Age:</strong> {pet.age} years</p>
                  <p><strong>Weight:</strong> {pet.weight} kg</p>
                  <p><strong>Recent Vaccination:</strong> {pet.recentVaccination}</p>
                  <p><strong>Recent Medication:</strong> {pet.recentMedication}</p>
                  <p><strong>Recent Vet Visit:</strong> {pet.recentVetVisit}</p>
                  <p><strong>Upcoming Reminders:</strong> {pet.upcomingReminders}</p>
                </div>
                <div className="pet-actions">
                  <button>Update</button>
                  <button>Add Reminder</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;