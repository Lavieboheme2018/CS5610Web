import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);
jest.mock('../components/BreedSelector', () => () => <div>Mock BreedSelector</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

const mockUser = {
  _id: '123',
  username: 'testuser',
  email: 'test@example.com',
  profileImage: { filename: 'profile.jpg' }
};

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

const renderProfilePage = () => {
  return render(
    <BrowserRouter>
      <ProfilePage />
    </BrowserRouter>
  );
};

describe('ProfilePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    URL.createObjectURL.mockReturnValue('mock-url');
    global.alert = jest.fn();
  });

  test('redirects to login if no token present', async () => {
    localStorage.clear();
    renderProfilePage();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('loads user profile and pets successfully', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      }));

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  test('handles profile update successfully', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      }));

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });

    // Add successful update mock
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Username updated successfully!" })
    }));

    const editButtons = await screen.findAllByText('Edit');
    await userEvent.click(editButtons[0]);

    const input = screen.getByPlaceholderText('Enter new username');
    await userEvent.type(input, 'newusername');

    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Username updated successfully!');
    });
  });

  test('handles adding new pet successfully', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      }));
  
    renderProfilePage();
  
    // Click Add New Pet button
    const addPetButton = await screen.findByText('Add New Pet');
    await userEvent.click(addPetButton);
  
    // Input pet details
    const nameInput = screen.getByLabelText('Pet Name:');
    const ageInput = screen.getByLabelText('Age (years):');
  
    await userEvent.type(nameInput, 'Buddy');
    await userEvent.type(ageInput, '2');
  
    // Mock successful pet creation
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        _id: '3',
        name: 'Buddy',
        breed: 'Labrador',
        age: 2
      })
    }));
  
    // Submit form
    const addButton = screen.getByText('Add Pet');
    await userEvent.click(addButton);
  
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Pet added successfully!');
    });
  });

  test('handles navigation to pet details', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      }));

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getAllByText('View Details')[0]).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByText('View Details')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  });

  test('handles form cancellation', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      }));

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByText('Edit')[0]);
    await userEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByPlaceholderText('Enter new username')).not.toBeInTheDocument();
  });
});