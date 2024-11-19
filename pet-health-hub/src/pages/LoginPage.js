import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      const userResponse = await fetch('http://localhost:3001/api/users/profile', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const userData = await userResponse.json();
      setUser(userData);
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        {/* 登录表单已在之前实现 */}
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
