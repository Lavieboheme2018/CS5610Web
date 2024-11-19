// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [pets, setPets] = useState([]);
  const [newPet, setNewPet] = useState({ name: '', age: '', breed: '', weight: '' });

  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pets/user/USER_ID', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error.message);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/pets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newPet),
      });
      if (response.ok) {
        const pet = await response.json();
        setPets([...pets, pet]);
        setNewPet({ name: '', age: '', breed: '', weight: '' });
      }
    } catch (error) {
      console.error('Error adding pet:', error.message);
    }
  };

  const handleUpdatePet = async (id, updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const updatedPet = await response.json();
        setPets(pets.map((pet) => (pet._id === id ? updatedPet : pet)));
      }
    } catch (error) {
      console.error('Error updating pet:', error.message);
    }
  };

  const handleDeletePet = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setPets(pets.filter((pet) => pet._id !== id));
      }
    } catch (error) {
      console.error('Error deleting pet:', error.message);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        <section className="add-pet">
          <h2>Add a New Pet</h2>
          <form onSubmit={handleAddPet}>
            <input
              type="text"
              placeholder="Name"
              value={newPet.name}
              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={newPet.age}
              onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Breed"
              value={newPet.breed}
              onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={newPet.weight}
              onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
              required
            />
            <button type="submit">Add Pet</button>
          </form>
        </section>

        <section className="pets-profile">
          <h2>My Pets</h2>
          <div className="pets-list">
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <h3>{pet.name}</h3>
                <p>Breed: {pet.breed}</p>
                <p>Age: {pet.age} years</p>
                <p>Weight: {pet.weight} kg</p>
                <button
                  onClick={() =>
                    handleUpdatePet(pet._id, { name: 'Updated Name', age: pet.age, breed: pet.breed, weight: pet.weight })
                  }
                >
                  Update
                </button>
                <button onClick={() => handleDeletePet(pet._id)}>Delete</button>
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
