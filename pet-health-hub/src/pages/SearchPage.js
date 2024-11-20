import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState({ name: '', breed: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      console.error('Error during search:', error);
      alert('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <Header />
      <div className="search-container">
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
            {results.length > 0 ? (
              results.map((pet) => (
                <div key={pet._id} className="result-item">
                  <h3>{pet.name}</h3>
                  <p><strong>Breed:</strong> {pet.breed}</p>
                  <p><strong>Age:</strong> {pet.age} years</p>
                  <p><strong>Weight:</strong> {pet.weight} kg</p>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;