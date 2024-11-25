import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BreedSelector = ({ onSelectBreed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [breeds, setBreeds] = useState([]);
  const [filteredBreeds, setFilteredBreeds] = useState([]);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const dogResponse = await axios.get(
          `https://api.thedogapi.com/v1/breeds`,
          { headers: { 'x-api-key': process.env.DOG_API_KEY } }
        );
        const catResponse = await axios.get(
          `https://api.thecatapi.com/v1/breeds`,
          { headers: { 'x-api-key': process.env.CAT_API_KEY } }
        );
        const combinedBreeds = [
          ...dogResponse.data.map((breed) => ({ name: breed.name, type: 'Dog' })),
          ...catResponse.data.map((breed) => ({ name: breed.name, type: 'Cat' })),
        ];
        setBreeds(combinedBreeds);
        setFilteredBreeds(combinedBreeds);
      } catch (error) {
        console.error('Error fetching breeds:', error);
      }
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    const results = breeds.filter((breed) =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBreeds(results);
  }, [searchTerm, breeds]);

  return (
    <div>
      <input
        type="text"
        placeholder="Type to search breeds..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
      />
      {filteredBreeds.length > 0 && (
        <ul style={{ marginTop: '10px', padding: '0', listStyle: 'none', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          {filteredBreeds.map((breed, index) => (
            <li
              key={index}
                onClick={() => {
                    onSelectBreed(breed.name);
                    setSearchTerm(breed.name); // Update input with selected breed
                  }}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #ddd',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
                >
                  {breed.name} ({breed.type})
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    };
    
    export default BreedSelector;
    