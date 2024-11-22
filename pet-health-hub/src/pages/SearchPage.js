import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState({ name: '', breed: '' });
  const [results, setResults] = useState([]);
  const [petImages, setPetImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false); // Track search initiation
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearchTriggered(true); // Mark search as initiated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to search.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/pets/search?name=${query.name}&breed=${query.breed}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setResults(data);

      // Fetch images for pets with profile images
      data.forEach((pet) => {
        if (pet.profileImage?.filename) {
          fetchPetImage(pet._id, pet.profileImage.filename);
        }
      });
    } catch (error) {
      console.error('Error during search:', error);
      alert('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetImage = async (petId, filename) => {
    const token = localStorage.getItem('token');
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
        setPetImages((prev) => ({
          ...prev,
          [petId]: imageUrl,
        }));
      }
    } catch (error) {
      console.error(`Error fetching pet image for pet ${petId}:`, error);
    }
  };

  const renderPetCards = () =>
    results.map((pet) => (
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
    <div className="search-page">
      <Header />
      <div className="content-wrapper">
        <h1>Search for Your Pets!</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="name"
            placeholder="Search by Name"
            value={query.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="breed"
            placeholder="Search by Breed"
            value={query.breed}
            onChange={handleInputChange}
          />
          <button type="submit">Search</button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="results-container">
            {isSearchTriggered && ( // Display results only after search is triggered
              results.length > 0 ? renderPetCards() : <p>No results found</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
