import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/analytics';
import BlogCRM from '@/components/BlogCRM';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';

// Analytics configuration
const analyticsConfig = {
  appId: process.env.REACT_APP_ANALYTICS_ID,
  debug: process.env.NODE_ENV === 'development'
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate initial loading and setup
    const initializeApp = async () => {
      try {
        // Check if user has a preferred theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Initialize any required services or data
        await Promise.all([
          // Add any initialization promises here
          new Promise(resolve => setTimeout(resolve, 500)) // Minimum loading time for UX
        ]);

      } catch (err) {
        console.error('Initialization error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        document.documentElement.setAttribute(
          'data-theme',
          e.matches ? 'dark' : 'light'
        );
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="relative min-h-screen bg-background font-sans antialiased">
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
          >
            Skip to main content
          </a>

          {/* Main application content */}
          <main id="main-content" className="relative">
            <BlogCRM />
          </main>

          {/* Toast notifications */}
          <Toaster />

          {/* Analytics (only in production) */}
          {process.env.NODE_ENV === 'production' && (
            <Analytics {...analyticsConfig} />
          )}

          {/* Accessibility announcement region */}
          <div
            role="status"
            aria-live="polite"
            className="sr-only"
          />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Performance optimization
export default React.memo(App);