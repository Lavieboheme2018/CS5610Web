import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Header Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders navigation buttons when user is not logged in', () => {
    render(
      <UserContext.Provider value={{ user: null, setUser: jest.fn() }}>
        <Header />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });

  test('renders navigation buttons when user is logged in', () => {
    render(
      <UserContext.Provider value={{ user: { name: 'John Doe' }, setUser: jest.fn() }}>
        <Header />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  test('navigates correctly when buttons are clicked', () => {
    render(
      <UserContext.Provider value={{ user: { name: 'John Doe' }, setUser: jest.fn() }}>
        <Header />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByText('Resources'));
    expect(mockNavigate).toHaveBeenCalledWith('/resources');

    fireEvent.click(screen.getByText('Search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search');

    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('handles logout functionality correctly', () => {
    const mockSetUser = jest.fn();

    render(
      <UserContext.Provider value={{ user: { name: 'John Doe' }, setUser: mockSetUser }}>
        <Header />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    fireEvent.click(screen.getByText('Log Out'));
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
