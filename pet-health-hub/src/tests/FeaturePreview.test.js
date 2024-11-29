import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeaturePreview from '../components/FeaturePreview';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('FeaturePreview Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test('renders demo pets when not logged in', () => {
    render(<FeaturePreview isLoggedIn={false} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Preview Examples')).toBeInTheDocument();
    const petCards = screen.getAllByRole('button', { name: /View Details/i });
    expect(petCards).toHaveLength(4);
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Bella')).toBeInTheDocument();
  });

  test('renders user pets when logged in and fetches data', async () => {
    const mockPets = [
      { _id: '1', name: 'Buddy', breed: 'Beagle', age: 4 },
      { _id: '2', name: 'Milo', breed: 'Golden Retriever', age: 5 },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets,
    });
  
    render(<FeaturePreview isLoggedIn={true} />, { wrapper: MemoryRouter });
  
    // Wait for the fetch call and DOM update
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://pet-health-hub-backend.onrender.com/api/pets/user', expect.anything());
      expect(screen.getByText('Buddy')).toBeInTheDocument();
      expect(screen.getByText('Milo')).toBeInTheDocument();
    });
  });

  test('navigates to pet details when View Details is clicked', async () => {
    const mockPets = [
      { _id: '1', name: 'Buddy', breed: 'Beagle', age: 4 },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets,
    });

    render(<FeaturePreview isLoggedIn={true} />, { wrapper: MemoryRouter });

    await waitFor(() => expect(screen.getByText('Buddy')).toBeInTheDocument());

    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  });

  test('fetches pet images correctly', async () => {
    const mockPets = [
      { _id: '1', name: 'Buddy', breed: 'Beagle', age: 4, profileImage: { filename: 'buddy.png' } },
    ];
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPets,
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(),
      });

    render(<FeaturePreview isLoggedIn={true} />, { wrapper: MemoryRouter });

    await waitFor(() => expect(screen.getByText('Buddy')).toBeInTheDocument());
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(global.fetch).toHaveBeenCalledWith('https://pet-health-hub-backend.onrender.com/api/pets/image/buddy.png', expect.anything());
  });
});
