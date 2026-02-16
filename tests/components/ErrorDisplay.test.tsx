/**
 * Tests for ErrorDisplay Component
 *
 * Tests the error display UI component with different variants.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay, getUserFriendlyError } from '~/components/ui/ErrorDisplay';

describe('ErrorDisplay', () => {
  describe('getUserFriendlyError helper', () => {
    it('should return correct message for NETWORK_ERROR', () => {
      const result = getUserFriendlyError('NETWORK_ERROR');
      expect(result.title).toBe('Connection Problem');
      expect(result.action).toBe('Retry');
    });

    it('should return correct message for NOT_FOUND', () => {
      const result = getUserFriendlyError('NOT_FOUND');
      expect(result.title).toBe('Not Found');
      expect(result.action).toBe('Go Back');
    });

    it('should return correct message for SERVER_ERROR', () => {
      const result = getUserFriendlyError('SERVER_ERROR');
      expect(result.title).toBe('Something Went Wrong');
    });

    it('should return default message for undefined error type', () => {
      const result = getUserFriendlyError(undefined);
      expect(result.title).toBe('Oops!');
    });
  });

  describe('inline variant (default)', () => {
    it('should render error message', () => {
      render(<ErrorDisplay error={{ message: 'Test error message' }} />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render error title based on type', () => {
      render(<ErrorDisplay error={{ type: 'DATABASE_ERROR', message: 'DB error' }} />);
      expect(screen.getByText('Database Error')).toBeInTheDocument();
    });

    it('should show retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<ErrorDisplay error={{ message: 'Error' }} onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should show dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn();
      render(<ErrorDisplay error={{ message: 'Error' }} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();

      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ErrorDisplay error={{ message: 'Error' }} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('page variant', () => {
    it('should render centered full-page error', () => {
      render(
        <ErrorDisplay
          error={{ type: 'NOT_FOUND', message: 'Page not found' }}
          variant="page"
        />
      );

      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Page not found')).toBeInTheDocument();
    });

    it('should show go back button when onGoBack is provided', () => {
      const onGoBack = vi.fn();
      render(
        <ErrorDisplay
          error={{ message: 'Error' }}
          variant="page"
          onGoBack={onGoBack}
        />
      );

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      expect(goBackButton).toBeInTheDocument();

      fireEvent.click(goBackButton);
      expect(onGoBack).toHaveBeenCalledTimes(1);
    });

    it('should show retry button in page variant', () => {
      const onRetry = vi.fn();
      render(
        <ErrorDisplay
          error={{ message: 'Error' }}
          variant="page"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('toast variant', () => {
    it('should render toast-style error', () => {
      render(
        <ErrorDisplay
          error={{ type: 'SERVER_ERROR', message: 'Server error' }}
          variant="toast"
        />
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    it('should show dismiss button in toast', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorDisplay
          error={{ message: 'Error' }}
          variant="toast"
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should show retry link in toast when onRetry provided', () => {
      const onRetry = vi.fn();
      render(
        <ErrorDisplay
          error={{ message: 'Error' }}
          variant="toast"
          onRetry={onRetry}
        />
      );

      // In toast variant, retry is a link/button, not a Button component
      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('error types', () => {
    it('should handle VALIDATION_ERROR type', () => {
      render(
        <ErrorDisplay error={{ type: 'VALIDATION_ERROR', message: 'Invalid input' }} />
      );
      expect(screen.getByText('Invalid Input')).toBeInTheDocument();
    });

    it('should handle PERMISSION_DENIED type', () => {
      render(
        <ErrorDisplay error={{ type: 'PERMISSION_DENIED', message: 'Access denied' }} />
      );
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should handle unknown error type gracefully', () => {
      render(
        <ErrorDisplay
          error={{ type: 'UNKNOWN' as const, message: 'Unknown error' }}
        />
      );
      expect(screen.getByText('Oops!')).toBeInTheDocument();
    });
  });

  describe('custom action', () => {
    it('should render custom action button', () => {
      render(
        <ErrorDisplay
          error={{ message: 'Error' }}
          action={<button>Custom Action</button>}
        />
      );

      expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument();
    });
  });
});
