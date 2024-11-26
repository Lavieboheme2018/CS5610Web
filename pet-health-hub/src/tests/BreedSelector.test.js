import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BreedSelector from '../components/BreedSelector';

// Mock axios module
jest.mock('axios', () => ({
  get: jest.fn()
}));

import axios from 'axios';

// Mock API responses
const mockDogData = [
  { name: 'Labrador Retriever' },
  { name: 'German Shepherd' }
];

const mockCatData = [
  { name: 'Persian' },
  { name: 'Siamese' }
];

describe('BreedSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    axios.get.mockImplementation((url) => {
      if (url.includes('thedogapi')) {
        return Promise.resolve({ data: mockDogData });
      }
      if (url.includes('thecatapi')) {
        return Promise.resolve({ data: mockCatData });
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders search input correctly', () => {
    render(<BreedSelector onSelectBreed={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText('Type to search breeds...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('displays breed list after API calls', async () => {
    render(<BreedSelector onSelectBreed={() => {}} />);
    
    await screen.findByText('Labrador Retriever (Dog)');
    await screen.findByText('Persian (Cat)');
    
    expect(screen.getByText('Labrador Retriever (Dog)')).toBeInTheDocument();
    expect(screen.getByText('Persian (Cat)')).toBeInTheDocument();
    expect(screen.getByText('German Shepherd (Dog)')).toBeInTheDocument();
    expect(screen.getByText('Siamese (Cat)')).toBeInTheDocument();
  });

  test('filters breeds based on search input', async () => {
    render(<BreedSelector onSelectBreed={() => {}} />);
    
    // Wait for initial data to load
    await screen.findByText('Labrador Retriever (Dog)');
    
    const searchInput = screen.getByPlaceholderText('Type to search breeds...');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'persian');
    
    // Wait for the filtering to take effect
    await waitFor(() => {
      expect(screen.getByText('Persian (Cat)')).toBeInTheDocument();
      expect(screen.queryByText('Labrador Retriever (Dog)')).not.toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset axios mock to throw an error
    axios.get.mockReset();
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<BreedSelector onSelectBreed={() => {}} />);
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('calls onSelectBreed with correct breed name', async () => {
    const mockOnSelectBreed = jest.fn();
    render(<BreedSelector onSelectBreed={mockOnSelectBreed} />);
    
    const breedElement = await screen.findByText('Persian (Cat)');
    await userEvent.click(breedElement);
    
    expect(mockOnSelectBreed).toHaveBeenCalledWith('Persian');
  });

  test('handles empty search results', async () => {
    render(<BreedSelector onSelectBreed={() => {}} />);
    
    // Wait for initial data to load
    await screen.findByText('Labrador Retriever (Dog)');
    
    const searchInput = screen.getByPlaceholderText('Type to search breeds...');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'nonexistentbreed');
    
    // Wait for the filtering to take effect
    await waitFor(() => {
      expect(screen.queryByText('Labrador Retriever (Dog)')).not.toBeInTheDocument();
      expect(screen.queryByText('Persian (Cat)')).not.toBeInTheDocument();
    });
  });
});