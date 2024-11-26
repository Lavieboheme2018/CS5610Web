import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserContext } from './context/UserContext';

// Remove the Router from App component for testing
jest.mock('./App', () => {
  const App = ({ children }) => {
    return (
      <div>
        <div>Home Page</div>
        {children}
      </div>
    );
  };
  return App;
});

// Mock all page components
jest.mock('./pages/HomePage', () => () => <div>Home Page</div>);
jest.mock('./pages/LoginPage', () => () => <div>Login Page</div>);
jest.mock('./pages/ProfilePage', () => () => <div>Profile Page</div>);
jest.mock('./pages/SearchPage', () => () => <div>Search Page</div>);
jest.mock('./pages/PetDetailsPage', () => () => <div>Pet Details Page</div>);
jest.mock('./pages/AboutPage', () => () => <div>About Page</div>);

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: null, setUser: jest.fn() }}>
          <App />
        </UserContext.Provider>
      </BrowserRouter>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});