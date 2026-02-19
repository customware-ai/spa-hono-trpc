import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '~/components/ui/Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('variants', () => {
    it('should apply default variant by default', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge.className).toContain('bg-primary');
    });

    it('should apply success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge.className).toContain('bg-green-100');
    });

    it('should apply warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge.className).toContain('bg-amber-100');
    });

    it('should apply danger variant', () => {
      render(<Badge variant="destructive">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge.className).toContain('bg-destructive');
    });

    it('should apply info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge.className).toContain('bg-blue-100');
    });
  });

  describe('styling', () => {
    it('should apply base styles', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('items-center');
      expect(badge.className).toContain('text-xs');
    });

    it('should apply padding styles', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('py-0.5');
    });

    it('should merge custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge.className).toContain('custom-class');
    });
  });

  describe('additional props', () => {
    it('should pass through additional span props', () => {
      render(<Badge id="test-badge" data-testid="badge">Prop</Badge>);
      expect(screen.getByTestId('badge')).toHaveAttribute('id', 'test-badge');
    });
  });
});
