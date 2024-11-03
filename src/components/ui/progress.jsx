import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ 
  className, 
  value, 
  max = 100,
  indicatorClassName,
  // Animation duration in ms
  duration = 500,
  // Custom gradient colors
  gradientFrom,
  gradientTo,
  // Optional custom indicator rendering
  renderIndicator,
  // Accessibility
  label,
  "aria-label": ariaLabel,
  ...props 
}, ref) => {
  // Track the previous value for animations
  const [prevValue, setPrevValue] = React.useState(value);

  // Animate value changes
  React.useEffect(() => {
    setPrevValue(value);
  }, [value]);

  // Calculate the progress percentage
  const percentage = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));

  // Generate gradient style if colors are provided
  const gradientStyle = React.useMemo(() => {
    if (gradientFrom && gradientTo) {
      return {
        backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
      };
    }
    return {};
  }, [gradientFrom, gradientTo]);

  return (
    <div className="relative">
      {label && (
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
        aria-label={ariaLabel || label || "Progress"}
        value={value}
        max={max}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 bg-primary transition-transform",
            indicatorClassName
          )}
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
            transition: `transform ${duration}ms cubic-bezier(0.65, 0, 0.35, 1)`,
            ...gradientStyle,
          }}
        >
          {renderIndicator && renderIndicator(percentage)}
        </ProgressPrimitive.Indicator>

        {/* Animated glow effect */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.3) 50%,
                transparent 100%
              )
            `,
            animation: 'progress-glow 2s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </ProgressPrimitive.Root>

      {/* Optional visual markers */}
      <div className="relative mt-1">
        <div className="absolute left-0 right-0 flex justify-between">
          {[0, 25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className={cn(
                "h-1 w-0.5 bg-muted-foreground/30",
                marker <= percentage && "bg-primary/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Screen reader only percentage announcement */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {Math.round(percentage)}% complete
      </div>

      <style jsx>{`
        @keyframes progress-glow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
});

Progress.displayName = "Progress";

// PropTypes for development
if (process.env.NODE_ENV === 'development') {
  Progress.propTypes = {
    // Value between 0 and max
    value: PropTypes.number,
    // Maximum value (defaults to 100)
    max: PropTypes.number,
    // Class name for the root element
    className: PropTypes.string,
    // Class name for the indicator element
    indicatorClassName: PropTypes.string,
    // Animation duration in milliseconds
    duration: PropTypes.number,
    // Gradient colors
    gradientFrom: PropTypes.string,
    gradientTo: PropTypes.string,
    // Custom indicator renderer
    renderIndicator: PropTypes.func,
    // Accessibility label
    label: PropTypes.string,
    'aria-label': PropTypes.string,
  };
}

// Custom hook for animated progress
export function useAnimatedProgress({
  value,
  duration = 1000,
  easingFn = (t) => t * t, // Default quadratic easing
} = {}) {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  const frameRef = React.useRef();
  const startTimeRef = React.useRef();

  React.useEffect(() => {
    if (typeof value !== 'number') return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      setAnimatedValue(value * easedProgress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, easingFn]);

  return animatedValue;
}

// Preset configurations
export const progressPresets = {
  default: {},
  success: {
    gradientFrom: 'hsl(var(--success))',
    gradientTo: 'hsl(var(--success-foreground))',
    indicatorClassName: 'bg-success',
  },
  warning: {
    gradientFrom: 'hsl(var(--warning))',
    gradientTo: 'hsl(var(--warning-foreground))',
    indicatorClassName: 'bg-warning',
  },
  error: {
    gradientFrom: 'hsl(var(--destructive))',
    gradientTo: 'hsl(var(--destructive-foreground))',
    indicatorClassName: 'bg-destructive',
  },
};

export { Progress };