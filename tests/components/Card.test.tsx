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

  describe('variants', () => {
    it('should apply default variant by default', () => {
      render(<Card data-testid="card">Default</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('border');
    });

    it('should apply elevated variant', () => {
      render(<Card variant="elevated" data-testid="card">Elevated</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('shadow-soft');
    });

    it('should apply outlined variant', () => {
      render(<Card variant="outlined" data-testid="card">Outlined</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('bg-transparent');
      expect(card.className).toContain('border');
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('rounded-lg');
      expect(card.className).toContain('p-5');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('custom-class');
      expect(card.className).toContain('rounded-lg');
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
    it('should render title when provided', () => {
      render(<CardHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<CardHeader description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render both title and description', () => {
      render(<CardHeader title="Title" description="Description" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(<CardHeader>Custom content</CardHeader>);
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    it('should render action slot', () => {
      render(<CardHeader action={<button>Action</button>} />);
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('title styling', () => {
    it('should apply title styles', () => {
      render(<CardHeader title="Test" />);
      const title = screen.getByText('Test');
      expect(title.tagName).toBe('H3');
      expect(title.className).toContain('font-semibold');
    });
  });

  describe('description styling', () => {
    it('should apply description styles', () => {
      render(<CardHeader description="Test" />);
      const description = screen.getByText('Test');
      expect(description.tagName).toBe('P');
      expect(description.className).toContain('text-sm');
    });
  });

  describe('layout', () => {
    it('should have flex layout', () => {
      render(<CardHeader data-testid="header" title="Test" />);
      const header = screen.getByTestId('header');
      expect(header.className).toContain('flex');
      expect(header.className).toContain('justify-between');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<CardHeader className="custom-class" data-testid="header" />);
      const header = screen.getByTestId('header');
      expect(header.className).toContain('custom-class');
      expect(header.className).toContain('flex');
    });
  });
});
