import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  withCredentials: true, // if using cookies for authentication
});

export const fetchBreeds = async () => {
  try {
    const response = await API.get('/api/pets/breeds');
    return response.data;
  } catch (error) {
    console.error('Error fetching breeds:', error);
    throw error;
  }
};

export default API;
