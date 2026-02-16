import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '~/components/ui/Collapsible';

describe('Collapsible', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });

    it('should not show content when closed by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('should show content when defaultOpen is true', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Visible Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });
  });

  describe('trigger', () => {
    it('should toggle content when trigger is clicked', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      // Initially closed
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click to close
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should have correct aria attributes when closed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText('Toggle');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have correct aria attributes when open', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText('Toggle');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render chevron icon by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText('Toggle').closest('button');
      expect(trigger?.querySelector('svg')).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger showIcon={false}>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText('Toggle').closest('button');
      expect(trigger?.querySelector('svg')).not.toBeInTheDocument();
    });

    it('should be a button element', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should have role="region"', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should have aria-labelledby referencing the trigger', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      const content = screen.getByRole('region');

      expect(content).toHaveAttribute('aria-labelledby', trigger.id);
    });

    it('should apply custom className', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent className="custom-content">Content</CollapsibleContent>
        </Collapsible>
      );

      const content = screen.getByRole('region');
      expect(content.className).toContain('custom-content');
    });
  });

  describe('controlled mode', () => {
    it('should respect controlled open prop', () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when toggled', () => {
      const onOpenChange = vi.fn();
      render(
        <Collapsible open={false} onOpenChange={onOpenChange}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      fireEvent.click(screen.getByText('Toggle'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('should work with controlled state', () => {
      function ControlledCollapsible(): React.ReactElement {
        const [open, setOpen] = useState(false);
        return (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>Content</CollapsibleContent>
          </Collapsible>
        );
      }

      render(<ControlledCollapsible />);

      // Initially closed
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click to close
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should not toggle when disabled', () => {
      render(
        <Collapsible disabled>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should apply disabled styles', () => {
      render(
        <Collapsible disabled data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible.className).toContain('opacity-50');
      expect(collapsible.className).toContain('pointer-events-none');
    });

    it('should have data-disabled attribute when disabled', () => {
      render(
        <Collapsible disabled data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-disabled');
    });
  });

  describe('data attributes', () => {
    it('should have data-state="closed" when closed', () => {
      render(
        <Collapsible data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-state', 'closed');
    });

    it('should have data-state="open" when open', () => {
      render(
        <Collapsible defaultOpen data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-state', 'open');
    });
  });

  describe('icon position', () => {
    it('should render icon on the left by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      const children = Array.from(trigger.childNodes);
      const iconIndex = children.findIndex(
        (node) => node.nodeName === 'svg' || (node as Element).querySelector?.('svg')
      );
      const textIndex = children.findIndex(
        (node) => node.textContent === 'Toggle'
      );

      // Icon should come before text in DOM (lower index)
      expect(iconIndex).toBeLessThan(textIndex);
    });

    it('should render icon on the right when iconPosition="right"', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger iconPosition="right">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      const children = Array.from(trigger.childNodes);
      const iconIndex = children.findIndex(
        (node) => node.nodeName === 'svg' || (node as Element).querySelector?.('svg')
      );
      const textIndex = children.findIndex(
        (node) => node.textContent === 'Toggle'
      );

      // Icon should come after text in DOM (higher index)
      expect(iconIndex).toBeGreaterThan(textIndex);
    });
  });

  describe('custom className', () => {
    it('should apply custom className to Collapsible', () => {
      render(
        <Collapsible className="custom-collapsible" data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible.className).toContain('custom-collapsible');
    });

    it('should apply custom className to trigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger className="custom-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger.className).toContain('custom-trigger');
    });
  });

  describe('error handling', () => {
    it('should throw error when CollapsibleTrigger is used outside Collapsible', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CollapsibleTrigger>Toggle</CollapsibleTrigger>);
      }).toThrow('Collapsible components must be used within a Collapsible');

      consoleSpy.mockRestore();
    });

    it('should throw error when CollapsibleContent is used outside Collapsible', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CollapsibleContent>Content</CollapsibleContent>);
      }).toThrow('Collapsible components must be used within a Collapsible');

      consoleSpy.mockRestore();
    });
  });
});
