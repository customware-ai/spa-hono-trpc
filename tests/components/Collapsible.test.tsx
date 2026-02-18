import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
  Collapsible,
} from '~/components/ui/Collapsible';

describe('Collapsible', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(
        <Collapsible trigger="Toggle">
          Content
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });

    it('should not show content when closed by default', () => {
      render(
        <Collapsible trigger="Toggle">
          Hidden Content
        </Collapsible>
      );
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('should show content when defaultOpen is true', () => {
      render(
        <Collapsible trigger="Toggle" defaultOpen>
          Visible Content
        </Collapsible>
      );
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });
  });

  describe('trigger', () => {
    it('should toggle content when trigger is clicked', () => {
      render(
        <Collapsible trigger="Toggle">
          Content
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
        <Collapsible trigger="Toggle">
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have correct aria attributes when open', () => {
      render(
        <Collapsible trigger="Toggle" defaultOpen>
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render chevron icon by default', () => {
      render(
        <Collapsible trigger="Toggle">
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger.querySelector('svg')).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      render(
        <Collapsible trigger="Toggle" showIcon={false}>
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger.querySelector('svg')).not.toBeInTheDocument();
    });

    it('should be a button element', () => {
      render(
        <Collapsible trigger="Toggle">
          Content
        </Collapsible>
      );

      expect(screen.getByRole('button', { name: /Toggle/i })).toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should have role="region"', () => {
      render(
        <Collapsible trigger="Toggle" defaultOpen>
          Content
        </Collapsible>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Collapsible trigger="Toggle" defaultOpen contentClassName="custom-content">
          Content
        </Collapsible>
      );

      const content = screen.getByRole('region');
      expect(content.className).toContain('custom-content');
    });
  });

  describe('controlled mode', () => {
    it('should respect controlled open prop', () => {
      render(
        <Collapsible trigger="Toggle" open={true}>
          Content
        </Collapsible>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when toggled', () => {
      const onOpenChange = vi.fn();
      render(
        <Collapsible trigger="Toggle" open={false} onOpenChange={onOpenChange}>
          Content
        </Collapsible>
      );

      fireEvent.click(screen.getByText('Toggle'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('should work with controlled state', () => {
      function ControlledCollapsible(): React.ReactElement {
        const [open, setOpen] = useState(false);
        return (
          <Collapsible trigger="Toggle" open={open} onOpenChange={setOpen}>
            Content
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
        <Collapsible trigger="Toggle" disabled>
          Content
        </Collapsible>
      );

      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('data attributes', () => {
    it('should have data-state="closed" when closed', () => {
      render(
        <Collapsible trigger="Toggle" data-testid="collapsible">
          Content
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-state', 'closed');
    });

    it('should have data-state="open" when open', () => {
      render(
        <Collapsible trigger="Toggle" defaultOpen data-testid="collapsible">
          Content
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible).toHaveAttribute('data-state', 'open');
    });
  });

  describe('icon position', () => {
    it('should render icon on the left by default', () => {
      render(
        <Collapsible trigger="Toggle">
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      const children = Array.from(trigger.firstChild!.childNodes);
      const iconIndex = children.findIndex(
        (node) => node.nodeName === 'svg' || (node as Element).querySelector?.('svg')
      );
      const textIndex = children.findIndex(
        (node) => node.textContent === 'Toggle'
      );

      expect(iconIndex).toBeLessThan(textIndex);
    });

    it('should render icon on the right when iconPosition="right"', () => {
      render(
        <Collapsible trigger="Toggle" iconPosition="right">
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      const children = Array.from(trigger.firstChild!.childNodes);
      const iconIndex = children.findIndex(
        (node) => node.nodeName === 'svg' || (node as Element).querySelector?.('svg')
      );
      const textIndex = children.findIndex(
        (node) => node.textContent === 'Toggle'
      );

      expect(iconIndex).toBeGreaterThan(textIndex);
    });
  });

  describe('custom className', () => {
    it('should apply custom className to Collapsible', () => {
      render(
        <Collapsible trigger="Toggle" className="custom-collapsible" data-testid="collapsible">
          Content
        </Collapsible>
      );

      const collapsible = screen.getByTestId('collapsible');
      expect(collapsible.className).toContain('custom-collapsible');
    });

    it('should apply custom className to trigger', () => {
      render(
        <Collapsible trigger="Toggle" triggerClassName="custom-trigger">
          Content
        </Collapsible>
      );

      const trigger = screen.getByRole('button');
      expect(trigger.className).toContain('custom-trigger');
    });
  });
});
