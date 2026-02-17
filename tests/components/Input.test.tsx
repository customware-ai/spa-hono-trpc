import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea } from '~/components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render an input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should link label to input via htmlFor', () => {
      render(<Input label="Email" id="email-input" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should generate id from label if not provided', () => {
      render(<Input label="User Name" />);
      const input = screen.getByLabelText('User Name');
      expect(input).toHaveAttribute('id', 'user-name');
    });
  });

  describe('error state', () => {
    it('should display error message when provided', () => {
      render(<Input error="Invalid input" />);
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('should apply error styles when error is present', () => {
      render(<Input error="Error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('border-danger');
    });

    it('should not show helper text when error is present', () => {
      render(<Input error="Error" helperText="Helper" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('helper text', () => {
    it('should display helper text when provided', () => {
      render(<Input helperText="This is helpful" />);
      expect(screen.getByText('This is helpful')).toBeInTheDocument();
    });

    it('should not display helper text when there is an error', () => {
      render(<Input helperText="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should handle onChange', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle onBlur', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      fireEvent.blur(screen.getByRole('textbox'));
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle onFocus', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalled();
    });
  });

  describe('input types', () => {
    it('should support email type', () => {
      render(<Input type="email" data-testid="email" />);
      expect(screen.getByTestId('email')).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input type="password" data-testid="password" />);
      expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
    });

    it('should support number type', () => {
      render(<Input type="number" data-testid="number" />);
      expect(screen.getByTestId('number')).toHaveAttribute('type', 'number');
    });
  });

  describe('additional props', () => {
    it('should pass through additional input props', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should apply custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('custom-class');
    });
  });

  describe('base styles', () => {
    it('should apply base styles', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('w-full');
      expect(input.className).toContain('rounded-md');
    });
  });
});

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render a textarea element', () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text').tagName).toBe('TEXTAREA');
    });

    it('should render with label when provided', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when provided', () => {
      render(<Textarea error="Required field" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('should apply error styles', () => {
      render(<Textarea error="Error" data-testid="textarea" />);
      expect(screen.getByTestId('textarea').className).toContain('border-danger');
    });
  });

  describe('helper text', () => {
    it('should display helper text when provided', () => {
      render(<Textarea helperText="Max 500 characters" />);
      expect(screen.getByText('Max 500 characters')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should handle onChange', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('base styles', () => {
    it('should apply textarea-specific styles', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea.className).toContain('min-h-');
      expect(textarea.className).toContain('resize-y');
    });
  });
});
