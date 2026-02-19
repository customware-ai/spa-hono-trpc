import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { ChevronDown } from "lucide-react"
import { cn } from "~/lib/utils"

const CollapsibleRoot = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  trigger?: React.ReactNode
  children: React.ReactNode
  showIcon?: boolean
  iconPosition?: "left" | "right"
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(({ trigger, children, showIcon = true, iconPosition = "left", className, triggerClassName, contentClassName, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false)

  // If no trigger is provided, act as the primitive root
  if (!trigger) {
    return (
      <CollapsibleRoot
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </CollapsibleRoot>
    )
  }

  return (
    <CollapsibleRoot
      ref={ref}
      open={props.open !== undefined ? props.open : isOpen}
      onOpenChange={props.onOpenChange || setIsOpen}
      className={cn("w-full border rounded-lg overflow-hidden", className)}
      {...props}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180",
          triggerClassName
        )}
      >
        <div className={cn("flex items-center gap-2", iconPosition === "right" && "w-full justify-between")}>
          {iconPosition === "left" && showIcon && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
          {trigger}
          {iconPosition === "right" && showIcon && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
            "overflow-hidden text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
            contentClassName
        )}
        role="region"
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
})
Collapsible.displayName = "Collapsible"

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleRoot }
