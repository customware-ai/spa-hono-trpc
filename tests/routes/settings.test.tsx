/**
 * Tests for Settings Page Route
 * 
 * Verifies that the settings page renders correctly.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPage from '~/routes/settings';
import { MemoryRouter } from 'react-router';

describe('Settings Route', () => {
  it('should render settings page with all sections', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /settings/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
    expect(screen.getByText('System Information')).toBeInTheDocument();
    
    // Check for some form elements
    expect(screen.getByText('Company Name')).toBeInTheDocument();
    expect(screen.getByText('Default Currency')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });
});
