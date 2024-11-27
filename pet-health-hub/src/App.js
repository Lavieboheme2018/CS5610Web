import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import PetDetailsPage from './pages/PetDetailsPage';
import AboutPage from './pages/AboutPage';
import ResourcePage from './pages/ResourcePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/details/:petId" element={<PetDetailsPage />} />
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/resources" element={<ResourcePage />} /> 
      </Routes>
    </Router>
  );
}

export default App;