import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import LoginPage from '../pages/LoginPage';

// Mock the Header and Footer components
jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

// Setup fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Define renderWithRouter helper function at the top level
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ setUser: jest.fn() }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.alert = jest.fn();
    
    // Reset fetch mock before each test
    mockFetch.mockReset();
  });

  test('renders login page with all elements', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText("Let's get started.")).toBeInTheDocument();
  });

  test('switches between login and signup forms', async () => {
    renderWithRouter(<LoginPage />);
    
    const signupTab = screen.getByTestId('signup-tab');
    await act(async () => {
      await userEvent.click(signupTab);
    });
    
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(signupTab).toHaveClass('active');
  });

  test('validates email and password inputs', async () => {
    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    await act(async () => {
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, '123');
      await userEvent.click(submitButton);
    });

    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('password-error')).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockToken = 'fake-token';
    const mockUserData = { id: 1, email: 'test@example.com' };

    mockFetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      );

    renderWithRouter(<LoginPage />);

    await act(async () => {
      await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      await userEvent.click(screen.getByTestId('login-submit'));
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('handles failed login', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false
      })
    );
    
    renderWithRouter(<LoginPage />);

    await act(async () => {
      await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      await userEvent.click(screen.getByTestId('login-submit'));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid email or password.');
    });
  });

  test('handles successful signup', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true
      })
    );
    
    renderWithRouter(<LoginPage />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('signup-tab'));
      await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      await userEvent.click(screen.getByTestId('signup-submit'));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
    });
  });

  test('handles failed signup', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false
      })
    );
    
    renderWithRouter(<LoginPage />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('signup-tab'));
      await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      await userEvent.click(screen.getByTestId('signup-submit'));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration failed. Please try again.');
    });
  });

  test('clears form and errors when switching tabs', async () => {
    renderWithRouter(<LoginPage />);
    
    await act(async () => {
      await userEvent.type(screen.getByTestId('email-input'), 'invalid-email');
      await userEvent.type(screen.getByTestId('password-input'), '123');
      await userEvent.click(screen.getByTestId('login-submit'));
    });
    
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('password-error')).toBeInTheDocument();
    
    await act(async () => {
      await userEvent.click(screen.getByTestId('signup-tab'));
    });
    
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toHaveValue('');
    expect(screen.getByTestId('password-input')).toHaveValue('');
  });
});