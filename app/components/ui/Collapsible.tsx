import { ChevronRight } from 'lucide-react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  type ReactElement,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';
import clsx from "clsx";

// Context for sharing state between Collapsible components
interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible components must be used within a Collapsible');
  }
  return context;
}

// Main Collapsible container
interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the collapsible is open (controlled mode) */
  open?: boolean;
  /** Default open state (uncontrolled mode) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
}

/**
 * Collapsible component for progressive disclosure of content.
 * Use for expandable sections, advanced options, and toggleable content.
 *
 * @example
 * ```tsx
 * // Controlled
 * <Collapsible open={isOpen} onOpenChange={setIsOpen}>
 *   <CollapsibleTrigger>Show Advanced Options</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <p>Advanced content here</p>
 *   </CollapsibleContent>
 * </Collapsible>
 *
 * // Uncontrolled with default open
 * <Collapsible defaultOpen>
 *   <CollapsibleTrigger>Details</CollapsibleTrigger>
 *   <CollapsibleContent>Details content</CollapsibleContent>
 * </Collapsible>
 * ```
 */
export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className = '',
  children,
  ...props
}: CollapsibleProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const id = useId();

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const toggle = useCallback((): void => {
    if (disabled) return;

    const newOpen = !open;
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [disabled, open, isControlled, onOpenChange]);

  const contextValue: CollapsibleContextValue = {
    open,
    toggle,
    contentId: `collapsible-content-${id}`,
    triggerId: `collapsible-trigger-${id}`,
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div
        className={clsx(disabled && 'opacity-50 pointer-events-none', className)}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// Collapsible Trigger button
interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether to show the default chevron icon */
  showIcon?: boolean;
  /** Position of the icon */
  iconPosition?: 'left' | 'right';
}

/**
 * Trigger button for the Collapsible component.
 * Toggles the open state when clicked.
 */
export function CollapsibleTrigger({
  showIcon = true,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}: CollapsibleTriggerProps): ReactElement {
  const { open, toggle, contentId, triggerId } = useCollapsibleContext();

  const iconElement = showIcon && (
    <ChevronRight
      className={clsx(
        'w-4 h-4 transition-transform duration-200',
        open && 'rotate-90'
      )}
      aria-hidden="true"
    />
  );

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={toggle}
      className={clsx(
        'flex items-center gap-2 text-sm font-medium',
        'hover:text-primary-600 dark:hover:text-primary-400',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
        className
      )}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </button>
  );
}

// Collapsible Content
interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to animate the content */
  animate?: boolean;
}

/**
 * Content container for the Collapsible component.
 * Shown/hidden based on the open state.
 */
export function CollapsibleContent({
  animate = true,
  className = '',
  children,
  ...props
}: CollapsibleContentProps): ReactElement | null {
  const { open, contentId, triggerId } = useCollapsibleContext();

  if (!open) {
    return null;
  }

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={clsx(
        animate && 'animate-in fade-in slide-in-from-top-2 duration-200',
        className
      )}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </div>
  );
}
