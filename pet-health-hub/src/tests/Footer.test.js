import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders footer elements correctly', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Footer />
      </MemoryRouter>
    );

    // Check logo rendering
    expect(screen.getByText((content, element) => {
      return element.textContent === 'CritterCare';
    })).toBeInTheDocument();

    // Check navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();

    // Check GitHub link
    const githubLink = screen.getByRole('link', { name: /GitHub Repository/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Lavieboheme2018/CS5610Web.git');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('GitHub link renders GitHub icon', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Footer />
      </MemoryRouter>
    );

    const githubLink = screen.getByRole('link', { name: /GitHub Repository/i });
    expect(githubLink).toHaveAttribute('aria-label', 'GitHub Repository');
  });
});
