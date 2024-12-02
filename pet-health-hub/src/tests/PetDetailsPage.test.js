import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PetDetailsPage from '../pages/PetDetailsPage';

// Mock BreedSelector to avoid axios issues
jest.mock('../components/BreedSelector', () => {
  return function MockBreedSelector({ onSelectBreed }) {
    return <div data-testid="breed-selector" />;
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ petId: 'test-pet-id' }),
  useNavigate: () => jest.fn()
}));

jest.mock('recharts', () => ({
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => children
}));

// Mock Header and Footer
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header" />;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer" />;
  };
});

describe('PetDetailsPage Component', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            _id: 'test-pet-id',
            name: 'Max',
            age: 3,
            weightTrend: [{ _id: 'w1', weight: 10.5, date: '2024-01-01' }],
            vaccinationHistory: [{ _id: 'v1', vaccine: 'Rabies', date: '2024-01-01' }]
          })
        })
      );
      URL.createObjectURL = jest.fn();
    });
  
    afterEach(() => {
      localStorage.clear();
      jest.clearAllMocks();
    });
  
    describe('Pet Details Display', () => {
      it('should show vaccination records', async () => {
        render(<BrowserRouter><PetDetailsPage /></BrowserRouter>);
  
        await waitFor(() => {
          const vaccineElements = screen.getAllByText('Rabies');
          expect(vaccineElements[0]).toBeInTheDocument();
          const dateElements = screen.getAllByText((content, element) => {
            return element.className === 'record-date' && content.includes('2024-01-01');
          });
          expect(dateElements[0]).toBeInTheDocument();
        });
      });
    });
  
    describe('Record Management', () => {
      it('should handle vaccination record deletion', async () => {
        render(<BrowserRouter><PetDetailsPage /></BrowserRouter>);
     
        await waitFor(() => {
          const editButtons = screen.getAllByRole('button', { name: /edit/i });
          fireEvent.click(editButtons[editButtons.length - 1]); // Click last edit button (vaccination record)
     
          const deleteButton = screen.getByRole('button', { name: /delete/i });
          window.confirm = jest.fn(() => true); // Mock confirm dialog
          fireEvent.click(deleteButton);
          
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/vaccination/v1'),
            expect.objectContaining({
              method: 'DELETE'
            })
          );
        });
      });
     });
  
    describe('Image Management', () => {
      it('should handle image upload interaction', async () => {
          render(<BrowserRouter><PetDetailsPage /></BrowserRouter>);
        
          await waitFor(() => {
            const uploadTrigger = screen.getByText(/Click to upload/);
            fireEvent.click(uploadTrigger);
          });
      });
    });
  });