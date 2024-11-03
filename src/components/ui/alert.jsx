import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Alert variants using class-variance-authority
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>[data-alert-icon]]:absolute [&>[data-alert-icon]]:left-4 [&>[data-alert-icon]]:top-4 [&>[data-alert-icon]]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: 
          "border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info:
          "border-blue-500/50 text-blue-600 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Alert Icon container
const AlertIcon = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-alert-icon
    className={cn("mr-4 [&>svg]:h-4 [&>svg]:w-4", className)}
    {...props}
  />
));
AlertIcon.displayName = "AlertIcon";

// Main Alert component
const Alert = React.forwardRef(({ 
  className, 
  variant, 
  icon,
  children,
  onClose,
  autoClose = 0,
  ...props 
}, ref) => {
  // Handle auto-close functionality
  React.useEffect(() => {
    if (autoClose > 0 && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && <AlertIcon>{icon}</AlertIcon>}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
});
Alert.displayName = "Alert";

// Alert Title component
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

// Alert Description component
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// Alert Container for managing multiple alerts
const AlertContainer = React.forwardRef(({ 
  className,
  position = "bottom-right",
  ...props 
}, ref) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-2 p-4",
        positionClasses[position],
        className
      )}
      {...props}
    />
  );
});
AlertContainer.displayName = "AlertContainer";

// Custom hook for managing alerts
export function useAlerts(initial = []) {
  const [alerts, setAlerts] = React.useState(initial);

  const addAlert = React.useCallback((alert) => {
    const id = Math.random().toString(36).slice(2);
    setAlerts(prev => [...prev, { ...alert, id }]);
    return id;
  }, []);

  const removeAlert = React.useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
  };
}

// PropTypes for development
if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');
  
  Alert.propTypes = {
    variant: PropTypes.oneOf(['default', 'destructive', 'success', 'warning', 'info']),
    icon: PropTypes.node,
    onClose: PropTypes.func,
    autoClose: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
  };

  AlertContainer.propTypes = {
    position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    className: PropTypes.string,
    children: PropTypes.node,
  };
}

export { Alert, AlertTitle, AlertDescription, AlertContainer, AlertIcon };