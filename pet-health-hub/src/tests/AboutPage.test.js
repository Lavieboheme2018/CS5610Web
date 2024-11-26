import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from '../pages/AboutPage';

jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);

describe('AboutPage Component', () => {
  test('renders Header and Footer', () => {
    render(<AboutPage />);

    // Check for Header and Footer
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });

  test('renders About Us section', () => {
    render(<AboutPage />);

    // Check for About Us section
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Welcome to CritterCare, your one-stop platform for managing your beloved pets' health records, appointments, and much more./i
      )
    ).toBeInTheDocument();
  });

  test('renders Our Vision section', () => {
    render(<AboutPage />);

    // Check for Our Vision section
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(
      screen.getByText(
        /We aim to provide a comprehensive solution for pet owners, ensuring that every pet gets the love and care they deserve./i
      )
    ).toBeInTheDocument();
  });

  test('renders Our Team section', () => {
    render(<AboutPage />);

    // Check for Our Team section
    expect(screen.getByText('Our Team')).toBeInTheDocument();
    expect(
      screen.getByText(
        /CritterCare is built by a team of passionate pet lovers and tech enthusiasts, working together to create a better experience for pets and their owners./i
      )
    ).toBeInTheDocument();
  });
});
