/**
 * Tests for Dashboard/Home Page
 *
 * Tests the Dashboard component rendering and interactions.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { Mock } from 'vitest';

// We need to test the component in isolation since it uses useNavigate
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: (): Mock => vi.fn(),
    useRouteError: (): Error => new Error('Test error'),
    isRouteErrorResponse: (): boolean => false,
  };
});

// Import after mocking
import Dashboard, { ErrorBoundary } from '~/routes/home';

describe('Dashboard Page', () => {
  describe('Dashboard component', () => {
    it('should render dashboard title', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard (Demo)')).toBeInTheDocument();
    });

    it('should render demo metrics', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Total Revenue (Demo)')).toBeInTheDocument();
      expect(screen.getByText('New Leads (Demo)')).toBeInTheDocument();
      expect(screen.getByText('Active Orders (Demo)')).toBeInTheDocument();
    });

    it('should render metric values', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('$124,590')).toBeInTheDocument();
      expect(screen.getByText('48')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should render revenue chart section', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
      expect(screen.getByText('Monthly revenue performance')).toBeInTheDocument();
    });

    it('should render sales pipeline section', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Sales Pipeline (Demo)')).toBeInTheDocument();
      expect(screen.getByText('Current opportunities by stage')).toBeInTheDocument();
    });

    it('should render quick actions', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Add Customer')).toBeInTheDocument();
      expect(screen.getByText('Create Quote')).toBeInTheDocument();
    });

    it('should render pipeline stages', () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByText('Qualified')).toBeInTheDocument();
      expect(screen.getByText('Proposal')).toBeInTheDocument();
      expect(screen.getByText('Negotiation')).toBeInTheDocument();
      expect(screen.getByText('Closed Won')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    it('should render error display', () => {
      render(
        <MemoryRouter>
          <ErrorBoundary />
        </MemoryRouter>
      );

      // Should show the error title
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });
  });
});
