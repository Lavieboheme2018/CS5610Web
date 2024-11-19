// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        {/* 用户资料部分 */}
        <section className="user-profile">
          <h2>用户资料</h2>
          <div className="user-details">
            <div className="user-avatar">
              <div className="avatar-placeholder"></div>
            </div>
            <div className="user-info">
              <div className="form-group">
                <label>姓名</label>
                <input type="text" value={user.name || ''} readOnly />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input type="email" value={user.email} readOnly />
              </div>
            </div>
          </div>
        </section>

        {/* 宠物资料部分 */}
        <section className="pets-profile">
          <h2>宠物资料</h2>
          <div className="pets-list">
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-avatar">
                  <div className="avatar-placeholder"></div>
                  <p>{pet.name}</p>
                </div>
                <div className="pet-details">
                  <p><strong>品种:</strong> {pet.breed}</p>
                  <p><strong>年龄:</strong> {pet.age} 岁</p>
                  <p><strong>体重:</strong> {pet.weight} kg</p>
                </div>
                <div className="pet-actions">
                  <button onClick={() => handleDeletePet(pet._id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
          <div className="add-pet-form">
            <h3>添加新宠物</h3>
            <form onSubmit={handleAddPet}>
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  name="name"
                  value={newPet.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>品种</label>
                <input
                  type="text"
                  name="breed"
                  value={newPet.breed}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>年龄</label>
                <input
                  type="number"
                  name="age"
                  value={newPet.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>体重 (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={newPet.weight}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">添加宠物</button>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
