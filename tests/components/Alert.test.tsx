import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '~/components/ui/Alert';

describe('Alert', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('should render with role="alert"', () => {
      render(<Alert>Message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<Alert title="Important">Content</Alert>);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('should render default icon', () => {
      render(<Alert>Message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('svg')).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">!</span>;
      render(<Alert icon={customIcon}>Message</Alert>);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply info variant', () => {
      render(<Alert variant="info">Info</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-blue-50');
    });

    it('should apply success variant', () => {
      render(<Alert variant="success">Success</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-green-50');
    });

    it('should apply warning variant', () => {
      render(<Alert variant="warning">Warning</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-amber-50');
    });

    it('should apply danger variant', () => {
      render(<Alert variant="destructive">Danger</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('text-destructive');
    });
  });

  describe('dismissible', () => {
    it('should show dismiss button when dismissible is true', () => {
      const onDismiss = vi.fn();
      render(<Alert dismissible onDismiss={onDismiss}>Message</Alert>);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('should not show dismiss button when dismissible is false', () => {
      render(<Alert>Message</Alert>);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });

    it('should not show dismiss button without onDismiss handler', () => {
      render(<Alert dismissible>Message</Alert>);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      render(<Alert dismissible onDismiss={onDismiss}>Message</Alert>);
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('title styling', () => {
    it('should apply title styles', () => {
      render(<Alert title="Test Title">Content</Alert>);
      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H5');
      expect(title.className).toContain('font-medium');
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Alert>Message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('px-4');
      expect(alert.className).toContain('py-3');
      expect(alert.className).toContain('rounded-lg');
      expect(alert.className).toContain('border');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Alert className="custom-alert">Message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('custom-alert');
      expect(alert.className).toContain('relative');
    });
  });

  describe('additional props', () => {
    it('should pass through additional div props', () => {
      render(<Alert data-testid="alert" id="my-alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('id', 'my-alert');
    });
  });

  describe('icon per variant', () => {
    it('should render info icon for info variant', () => {
      render(<Alert variant="info">Info</Alert>);
      const alert = screen.getByRole('alert');
      const svg = alert.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render success icon for success variant', () => {
      render(<Alert variant="success">Success</Alert>);
      const alert = screen.getByRole('alert');
      const svg = alert.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      render(<Alert variant="warning">Warning</Alert>);
      const alert = screen.getByRole('alert');
      const svg = alert.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render danger icon for danger variant', () => {
      render(<Alert variant="destructive">Danger</Alert>);
      const alert = screen.getByRole('alert');
      const svg = alert.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
