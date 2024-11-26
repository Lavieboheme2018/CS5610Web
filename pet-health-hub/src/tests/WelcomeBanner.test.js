import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WelcomeBanner from '../components/WelcomeBanner';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('WelcomeBanner Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders all elements correctly', () => {
    render(
      <WelcomeBanner isLoggedIn={false} />,
      { wrapper: MemoryRouter }
    );

    // Check text rendering
    expect(screen.getByText("All Your Pet's Health Record,")).toBeInTheDocument();
    expect(screen.getByText('in One Place')).toBeInTheDocument();

    // Check button rendering
    expect(screen.getByRole('button', { name: 'Get Started!' })).toBeInTheDocument();

    // Check image rendering
    const mainImage = screen.getByAltText('Main example');
    const overlayImage = screen.getByAltText('Pet example');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', '/example.png');
    expect(overlayImage).toBeInTheDocument();
    expect(overlayImage).toHaveAttribute('src', '/example_pet.png');
  });

  test('displays correct button text when logged in', () => {
    render(
      <WelcomeBanner isLoggedIn={true} userName="John Doe" />,
      { wrapper: MemoryRouter }
    );

    const button = screen.getByRole('button', { name: 'Welcome, John Doe!' });
    expect(button).toBeInTheDocument();
  });

  test('navigates to login page when not logged in', () => {
    render(
      <WelcomeBanner isLoggedIn={false} />,
      { wrapper: MemoryRouter }
    );

    const button = screen.getByRole('button', { name: 'Get Started!' });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('does not navigate when user is logged in', () => {
    render(
      <WelcomeBanner isLoggedIn={true} userName="John Doe" />,
      { wrapper: MemoryRouter }
    );

    const button = screen.getByRole('button', { name: 'Welcome, John Doe!' });
    fireEvent.click(button);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
