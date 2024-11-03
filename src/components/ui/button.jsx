import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Button variants using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        info: "bg-blue-500 text-white hover:bg-blue-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-11 w-11",
      },
      loading: {
        true: "relative !text-transparent transition-none hover:!text-transparent",
      },
      fullWidth: {
        true: "w-full",
      },
      animated: {
        true: "transform transition-transform duration-200 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: true,
    },
  }
);

const Button = React.forwardRef(({
  className,
  variant,
  size,
  loading = false,
  fullWidth = false,
  animated = true,
  asChild = false,
  icon,
  loadingText = "Loading...",
  children,
  ...props
}, ref) => {
  // Use Radix UI's Slot component if asChild is true
  const Comp = asChild ? Slot : "button";

  // Combine all the props and classes
  const combinedProps = {
    className: cn(
      buttonVariants({ 
        variant, 
        size, 
        loading, 
        fullWidth,
        animated,
        className 
      })
    ),
    ref,
    ...props,
  };

  return (
    <Comp
      {...combinedProps}
      disabled={props.disabled || loading}
    >
      {/* Loading spinner */}
      {loading && (
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            {
              "flex items-center gap-2": loadingText,
            }
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText && (
            <span className="text-primary-foreground">{loadingText}</span>
          )}
        </div>
      )}

      {/* Button content */}
      <span className="flex items-center gap-2">
        {icon && <span className="button-icon">{icon}</span>}
        {children}
      </span>
    </Comp>
  );
});

Button.displayName = "Button";

// Button Group Component
const ButtonGroup = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  spacing = "default",
  children,
  ...props
}, ref) => {
  const spacingClasses = {
    none: "space-x-0",
    default: "space-x-2",
    loose: "space-x-4",
    tight: "space-x-1",
  };

  const groupClasses = cn(
    "inline-flex",
    orientation === "vertical" ? "flex-col" : "flex-row",
    orientation === "vertical" 
      ? {
          none: "space-y-0",
          default: "space-y-2",
          loose: "space-y-4",
          tight: "space-y-1",
        }[spacing]
      : spacingClasses[spacing],
    className
  );

  // Clone children and add variant and size props
  const decoratedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        variant: child.props.variant || variant,
        size: child.props.size || size,
      });
    }
    return child;
  });

  return (
    <div ref={ref} className={groupClasses} {...props}>
      {decoratedChildren}
    </div>
  );
});

ButtonGroup.displayName = "ButtonGroup";

// IconButton Component
const IconButton = React.forwardRef(({
  className,
  icon,
  tooltip,
  loading = false,
  ...props
}, ref) => {
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              className={cn("p-0", className)}
              size="icon"
              loading={loading}
              {...props}
            >
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      ref={ref}
      className={cn("p-0", className)}
      size="icon"
      loading={loading}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = "IconButton";

// LoadingButton Component
const LoadingButton = React.forwardRef(({
  loading = false,
  loadingText,
  children,
  ...props
}, ref) => (
  <Button ref={ref} loading={loading} loadingText={loadingText} {...props}>
    {children}
  </Button>
));

LoadingButton.displayName = "LoadingButton";

// PropTypes for development
if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');

  Button.propTypes = {
    variant: PropTypes.oneOf([
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'success',
      'warning',
      'info',
    ]),
    size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg']),
    loading: PropTypes.bool,
    fullWidth: PropTypes.bool,
    animated: PropTypes.bool,
    asChild: PropTypes.bool,
    icon: PropTypes.node,
    loadingText: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  ButtonGroup.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    spacing: PropTypes.oneOf(['none', 'default', 'loose', 'tight']),
    className: PropTypes.string,
    children: PropTypes.node,
  };

  IconButton.propTypes = {
    icon: PropTypes.node.isRequired,
    tooltip: PropTypes.string,
    loading: PropTypes.bool,
    className: PropTypes.string,
  };

  LoadingButton.propTypes = {
    loading: PropTypes.bool,
    loadingText: PropTypes.string,
    children: PropTypes.node,
  };
}

export { 
  Button, 
  ButtonGroup, 
  IconButton, 
  LoadingButton, 
  buttonVariants 
};