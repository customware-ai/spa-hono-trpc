import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Banner } from '~/components/ui/Banner';

describe('Banner', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Banner>Banner message</Banner>);
      expect(screen.getByText('Banner message')).toBeInTheDocument();
    });

    it('should render with role="status"', () => {
      render(<Banner>Message</Banner>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render default icon', () => {
      render(<Banner>Message</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.querySelector('svg')).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">!</span>;
      render(<Banner icon={customIcon}>Message</Banner>);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply info variant by default', () => {
      render(<Banner>Info</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('bg-teal-50');
      expect(banner.className).toContain('text-teal-800');
    });

    it('should apply success variant', () => {
      render(<Banner variant="success">Success</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('bg-primary-50');
      expect(banner.className).toContain('text-primary-800');
    });

    it('should apply warning variant', () => {
      render(<Banner variant="warning">Warning</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('bg-amber-50');
      expect(banner.className).toContain('text-amber-800');
    });

    it('should apply danger variant', () => {
      render(<Banner variant="danger">Danger</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('bg-red-50');
      expect(banner.className).toContain('text-red-800');
    });
  });

  describe('dismissible', () => {
    it('should show dismiss button when dismissible is true with onDismiss', () => {
      const onDismiss = vi.fn();
      render(<Banner dismissible onDismiss={onDismiss}>Message</Banner>);
      expect(screen.getByLabelText('Dismiss banner')).toBeInTheDocument();
    });

    it('should not show dismiss button when dismissible is false', () => {
      render(<Banner>Message</Banner>);
      expect(screen.queryByLabelText('Dismiss banner')).not.toBeInTheDocument();
    });

    it('should not show dismiss button without onDismiss handler', () => {
      render(<Banner dismissible>Message</Banner>);
      expect(screen.queryByLabelText('Dismiss banner')).not.toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      render(<Banner dismissible onDismiss={onDismiss}>Message</Banner>);
      fireEvent.click(screen.getByLabelText('Dismiss banner'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('action', () => {
    it('should render action when provided', () => {
      const action = <button data-testid="action-btn">Retry</button>;
      render(<Banner action={action}>Message</Banner>);
      expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    });

    it('should render action as clickable', () => {
      const handleClick = vi.fn();
      const action = <button onClick={handleClick}>Retry</button>;
      render(<Banner action={action}>Message</Banner>);
      fireEvent.click(screen.getByText('Retry'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render both action and dismiss button when both provided', () => {
      const onDismiss = vi.fn();
      const action = <button data-testid="action-btn">Retry</button>;
      render(
        <Banner dismissible onDismiss={onDismiss} action={action}>
          Message
        </Banner>
      );
      expect(screen.getByTestId('action-btn')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss banner')).toBeInTheDocument();
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Banner>Message</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('px-4');
      expect(banner.className).toContain('py-3');
      expect(banner.className).toContain('rounded-lg');
      expect(banner.className).toContain('border');
      expect(banner.className).toContain('flex');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Banner className="custom-banner mb-4">Message</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.className).toContain('custom-banner');
      expect(banner.className).toContain('mb-4');
      expect(banner.className).toContain('px-4');
    });
  });

  describe('additional props', () => {
    it('should pass through additional div props', () => {
      render(<Banner data-testid="banner" id="my-banner">Message</Banner>);
      const banner = screen.getByTestId('banner');
      expect(banner).toHaveAttribute('id', 'my-banner');
    });
  });

  describe('icon per variant', () => {
    it('should render info icon for info variant', () => {
      render(<Banner variant="info">Info</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.querySelector('svg')).toBeInTheDocument();
    });

    it('should render success icon for success variant', () => {
      render(<Banner variant="success">Success</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.querySelector('svg')).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      render(<Banner variant="warning">Warning</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.querySelector('svg')).toBeInTheDocument();
    });

    it('should render danger icon for danger variant', () => {
      render(<Banner variant="danger">Danger</Banner>);
      const banner = screen.getByRole('status');
      expect(banner.querySelector('svg')).toBeInTheDocument();
    });
  });
});
