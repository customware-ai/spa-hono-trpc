import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader } from '~/components/ui/Card';

describe('Card', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('border');
      expect(card.className).toContain('bg-card');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('custom-class');
    });
  });

  describe('additional props', () => {
    it('should pass through additional div props', () => {
      render(<Card data-testid="card" id="my-card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'my-card');
    });
  });
});

describe('CardHeader', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(<CardHeader>Custom content</CardHeader>);
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should have grid layout', () => {
      render(<CardHeader data-testid="header">Test</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header.className).toContain('grid');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<CardHeader className="custom-class" data-testid="header">Test</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header.className).toContain('custom-class');
      expect(header.className).toContain('grid');
    });
  });
});
