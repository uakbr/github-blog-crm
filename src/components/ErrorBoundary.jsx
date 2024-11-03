import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastError: null,
      errorStack: [],
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastError: new Date(),
      errorStack: [...prevState.errorStack, {
        error: error.toString(),
        timestamp: new Date(),
        componentStack: errorInfo.componentStack
      }]
    }));

    // Log error to our error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    if (process.env.NODE_ENV === 'production') {
      // Example error logging
      console.error('Error details:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      // You could send this to your error tracking service
      // Example: Sentry.captureException(error);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // Clear local storage and reload
    try {
      localStorage.clear();
      sessionStorage.clear();
      this.handleReload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      this.handleReload();
    }
  };

  handleReturn = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  renderErrorMessage() {
    const { error, errorInfo, errorCount, lastError } = this.state;

    // Determine severity of error message
    let severity = 'warning';
    if (errorCount > 3) severity = 'error';
    if (errorCount > 5) severity = 'critical';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive" className="border-destructive/50 dark:border-destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle className="ml-2">Application Error</AlertTitle>
            <AlertDescription className="mt-2">
              {severity === 'critical' ? (
                <p className="text-red-600 dark:text-red-400">
                  Multiple errors detected. Please try clearing your browser data.
                </p>
              ) : (
                <p>Something went wrong. Please try refreshing the page.</p>
              )}
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 space-y-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer hover:underline">
                      Error Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words bg-muted p-4 rounded-md text-xs">
                      {error && error.toString()}
                      {errorInfo && errorInfo.componentStack}
                    </pre>
                  </details>
                  
                  {errorCount > 1 && (
                    <p className="text-sm text-muted-foreground">
                      Error count: {errorCount}
                      {lastError && ` (Last occurred: ${lastError.toLocaleString()})`}
                    </p>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button
              onClick={this.handleReload}
              className="w-full"
              variant="default"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>

            {severity === 'critical' && (
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="destructive"
              >
                Reset Application
              </Button>
            )}

            <Button
              onClick={this.handleReturn}
              className="w-full"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            If this issue persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorMessage();
    }

    return this.props.children;
  }
}

// Optional: Add PropTypes if you're using them
if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');
  ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
  };
}

export default ErrorBoundary;