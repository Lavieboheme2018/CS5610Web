import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../pages/SearchPage';

// Mock Header and Footer components
jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock fetch
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn();

const mockPets = [
  {
    _id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    profileImage: { filename: 'max.jpg' }
  },
  {
    _id: '2',
    name: 'Luna',
    breed: 'Siamese',
    age: 2,
    profileImage: null
  }
];

const renderSearchPage = () => {
  return render(
    <BrowserRouter>
      <SearchPage />
    </BrowserRouter>
  );
};

describe('SearchPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.URL.createObjectURL.mockReturnValue('mock-url');
  });

  test('renders search page with all elements', () => {
    renderSearchPage();
    
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
    expect(screen.getByText('Search for Your Pets!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by Breed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('handles input changes', async () => {
    renderSearchPage();
    
    const nameInput = screen.getByPlaceholderText('Search by Name');
    const breedInput = screen.getByPlaceholderText('Search by Breed');

    await userEvent.type(nameInput, 'Max');
    await userEvent.type(breedInput, 'Golden');

    expect(nameInput).toHaveValue('Max');
    expect(breedInput).toHaveValue('Golden');
  });

  test('shows alert when searching without token', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation();
    renderSearchPage();
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    expect(mockAlert).toHaveBeenCalledWith('Please log in to search.');
    mockAlert.mockRestore();
  });

  test('handles successful search with results', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock successful search response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      })
    );

    renderSearchPage();

    // Fill and submit search form
    await userEvent.type(screen.getByPlaceholderText('Search by Name'), 'Max');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    // Verify pet details are displayed
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('3 years')).toBeInTheDocument();
  });

  test('handles search with no results', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock empty search response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    renderSearchPage();

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  test('handles search error', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation();
    
    // Mock failed search response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false
      })
    );

    renderSearchPage();

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('An error occurred while searching.');
    });

    mockAlert.mockRestore();
  });

  test('navigates to pet details when clicking view details', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock successful search response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      })
    );

    renderSearchPage();

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    // Click the View Details button
    const viewDetailsButton = screen.getAllByText('View Details')[0];
    await userEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  });

  test('displays loading state during search', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock slow response
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockPets)
        }), 100)
      )
    );

    renderSearchPage();

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });
  });

  test('fetches and displays pet images', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock successful search and image responses
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPets)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob())
        })
      );

    renderSearchPage();

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      const petImage = screen.getByAltText('Max');
      expect(petImage).toBeInTheDocument();
      expect(petImage).toHaveAttribute('src', 'mock-url');
    });
  });
});