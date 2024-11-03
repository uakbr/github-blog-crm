import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Card variants
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        destructive: "border-destructive/50 dark:border-destructive",
        success: "border-green-500/50 dark:border-green-500",
        warning: "border-yellow-500/50 dark:border-yellow-500",
        info: "border-blue-500/50 dark:border-blue-500",
      },
      hover: {
        true: "hover:shadow-md hover:-translate-y-0.5",
        false: "",
      },
      clickable: {
        true: "cursor-pointer active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      clickable: false,
    },
  }
);

const Card = React.forwardRef(({
  className,
  variant,
  hover = false,
  clickable = false,
  onClick,
  children,
  ...props
}, ref) => {
  // Determine if card should be clickable based on onClick or clickable prop
  const isClickable = onClick || clickable;

  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, clickable: isClickable }), className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({
  className,
  children,
  actions,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">{children}</div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({
  className,
  children,
  as: Comp = "h3",
  ...props
}, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </Comp>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({
  className,
  children,
  padding = true,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(padding && "p-6 pt-0", className)}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

// Loading state for Card
const CardSkeleton = React.forwardRef(({
  className,
  headerHeight = "h-[100px]",
  contentLines = 3,
  hasFooter = false,
  ...props
}, ref) => (
  <Card
    ref={ref}
    className={cn("animate-pulse", className)}
    {...props}
  >
    <div className={cn("bg-muted rounded-t-lg", headerHeight)} />
    <CardContent>
      {Array.from({ length: contentLines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-muted h-4 rounded",
            i !== contentLines - 1 && "mb-3",
            i === 0 && "w-3/4",
            i === 1 && "w-2/3",
            i === 2 && "w-1/2"
          )}
        />
      ))}
    </CardContent>
    {hasFooter && (
      <CardFooter>
        <div className="bg-muted h-8 w-24 rounded" />
      </CardFooter>
    )}
  </Card>
));
CardSkeleton.displayName = "CardSkeleton";

// Card with image support
const CardWithImage = React.forwardRef(({
  className,
  image,
  imageAlt,
  imagePosition = "top",
  imageHeight = "h-48",
  imageFit = "cover",
  children,
  ...props
}, ref) => {
  const imageClasses = cn(
    "w-full bg-muted",
    imageHeight,
    `object-${imageFit}`,
    {
      "rounded-t-lg": imagePosition === "top",
      "rounded-b-lg": imagePosition === "bottom",
      "rounded-l-lg": imagePosition === "left",
      "rounded-r-lg": imagePosition === "right",
    }
  );

  const content = (
    <div className="flex-1">
      {children}
    </div>
  );

  return (
    <Card
      ref={ref}
      className={cn(
        {
          "flex": imagePosition === "left" || imagePosition === "right",
        },
        className
      )}
      {...props}
    >
      {imagePosition === "left" && (
        <img src={image} alt={imageAlt} className={imageClasses} />
      )}
      {imagePosition === "top" && (
        <img src={image} alt={imageAlt} className={imageClasses} />
      )}
      {content}
      {imagePosition === "right" && (
        <img src={image} alt={imageAlt} className={imageClasses} />
      )}
      {imagePosition === "bottom" && (
        <img src={image} alt={imageAlt} className={imageClasses} />
      )}
    </Card>
  );
});
CardWithImage.displayName = "CardWithImage";

// PropTypes for development
if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');
  
  Card.propTypes = {
    variant: PropTypes.oneOf(['default', 'destructive', 'success', 'warning', 'info']),
    hover: PropTypes.bool,
    clickable: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  CardHeader.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    actions: PropTypes.node,
  };

  CardTitle.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    as: PropTypes.elementType,
  };

  CardDescription.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
  };

  CardContent.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    padding: PropTypes.bool,
  };

  CardFooter.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
  };

  CardSkeleton.propTypes = {
    className: PropTypes.string,
    headerHeight: PropTypes.string,
    contentLines: PropTypes.number,
    hasFooter: PropTypes.bool,
  };

  CardWithImage.propTypes = {
    className: PropTypes.string,
    image: PropTypes.string.isRequired,
    imageAlt: PropTypes.string.isRequired,
    imagePosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    imageHeight: PropTypes.string,
    imageFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
    children: PropTypes.node,
  };
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardSkeleton,
  CardWithImage,
  cardVariants,
};