import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null); // Track the pet being edited
  const [editingField, setEditingField] = useState(null); // 'email' or 'password'
  const [updatedValue, setUpdatedValue] = useState('');
  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchUserPets = async () => {
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
        console.error('Error fetching pets:', error);
      }
    };

    fetchUserProfile();
    fetchUserPets();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPet((prevPet) => ({
      ...prevPet,
      [name]: value,
    }));
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/pets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPet),
      });

      if (!response.ok) {
        throw new Error('Failed to add pet');
      }

      const addedPet = await response.json();
      setPets((prevPets) => [...prevPets, addedPet]);
      setNewPet({
        name: '',
        breed: '',
        age: '',
        weight: '',
      });
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet); // Set the pet to be edited
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${editingPet._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingPet),
      });

      if (!response.ok) {
        throw new Error('Failed to update pet');
      }

      const updatedPet = await response.json();
      setPets((prevPets) =>
        prevPets.map((pet) => (pet._id === updatedPet._id ? updatedPet : pet))
      );
      setEditingPet(null); // Clear editing state
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  };

  const handleDeletePet = async (petId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      setPets((prevPets) => prevPets.filter((pet) => pet._id !== petId));
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const handleUpdateProfile = async (field) => {
    const token = localStorage.getItem('token');
    try {
      const body = { [field]: updatedValue }; // Dynamically set the field being updated
  
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
  
      const updatedUser = await response.json(); // Optionally use this to update the frontend state
      setUser((prevUser) => ({ ...prevUser, [field]: updatedValue }));
      setEditingField(null);
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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
            <p>
                <strong>Username:</strong> {user.username}
                <button onClick={() => setEditingField('username')}>Edit</button>
              </p>
              {editingField === 'username' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile('username');
                  }}
                >
                  <input
                    type="username"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new username"
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}
              <p>
                <strong>Email:</strong> {user.email}
                <button onClick={() => setEditingField('email')}>Edit</button>
              </p>
              {editingField === 'email' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile('email');
                  }}
                >
                  <input
                    type="email"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new email"
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}
              <p>
                <strong>Password:</strong> ********
                <button onClick={() => setEditingField('password')}>Change</button>
              </p>
              {editingField === 'password' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile('password');
                  }}
                >
                  <input
                    type="password"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Pets Profile Section */}
        <section className="pets-profile">
          <h2>Pets</h2>
          <div className="pets-list">
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <h3>{pet.name}</h3>
                <p>
                  <strong>Breed:</strong> {pet.breed}
                </p>
                <p>
                  <strong>Age:</strong> {pet.age} years
                </p>
                <p>
                  <strong>Weight:</strong> {pet.weight} kg
                </p>
                <button onClick={() => handleEditPet(pet)}>Edit</button>
                <button onClick={() => handleDeletePet(pet._id)}>Delete</button>
              </div>
            ))}
          </div>
          {editingPet && (
            <form className="edit-pet-form" onSubmit={handleUpdatePet}>
              <h3>Edit Pet</h3>
              <input
                type="text"
                name="name"
                value={editingPet.name}
                onChange={(e) =>
                  setEditingPet({ ...editingPet, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                name="breed"
                value={editingPet.breed}
                onChange={(e) =>
                  setEditingPet({ ...editingPet, breed: e.target.value })
                }
                required
              />
              <input
                type="number"
                name="age"
                value={editingPet.age}
                onChange={(e) =>
                  setEditingPet({ ...editingPet, age: e.target.value })
                }
                required
              />
              <input
                type="number"
                name="weight"
                value={editingPet.weight}
                onChange={(e) =>
                  setEditingPet({ ...editingPet, weight: e.target.value })
                }
                required
              />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingPet(null)}>
                Cancel
              </button>
            </form>
          )}
        </section>

        <section className="add-pet">
          <h3>Add a New Pet</h3>
          <form onSubmit={handleAddPet}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newPet.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="breed"
              placeholder="Breed"
              value={newPet.breed}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={newPet.age}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={newPet.weight}
              onChange={handleInputChange}
              required
            />
            <button type="submit">Add Pet</button>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;