import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import { UserContext } from '../context/UserContext';

jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/WelcomeBanner', () => ({ isLoggedIn, userName }) => (
  <div>Mock WelcomeBanner - isLoggedIn: {isLoggedIn ? 'true' : 'false'}, userName: {userName}</div>
));
jest.mock('../components/FeaturePreview', () => ({ isLoggedIn }) => (
  <div>Mock FeaturePreview - isLoggedIn: {isLoggedIn ? 'true' : 'false'}</div>
));
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

describe('HomePage Component', () => {
  test('renders all components when user is not logged in', () => {
    const mockUserContextValue = { user: null };

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomePage />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    // Check for mocked child components
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(
      screen.getByText('Mock WelcomeBanner - isLoggedIn: false, userName:')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock FeaturePreview - isLoggedIn: false')
    ).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });

  test('renders all components when user is logged in', () => {
    const mockUserContextValue = { user: { username: 'JohnDoe' } };

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomePage />
      </UserContext.Provider>,
      { wrapper: MemoryRouter }
    );

    // Check for mocked child components
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mock WelcomeBanner - isLoggedIn: true, userName: JohnDoe'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock FeaturePreview - isLoggedIn: true')
    ).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });
});
