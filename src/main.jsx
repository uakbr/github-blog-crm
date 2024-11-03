import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';
import { initializeAnalytics, trackEvent, trackPageView } from '@/utils/analytics';

// Performance monitoring
const reportWebVitals = (metric) => {
  // Send metrics to your analytics service
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_category: 'Web Vitals',
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
};

// Error tracking
const logError = (error, errorInfo) => {
  // Log errors to your error tracking service
  if (process.env.NODE_ENV === 'production') {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    // Example: Send to error tracking service
    // Sentry.captureException(error);
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, {
    type: 'Unhandled Promise Rejection',
    promise: event.promise,
  });
});

// Handle runtime errors
window.addEventListener('error', (event) => {
  logError(event.error, {
    type: 'Runtime Error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Development environment checks
if (process.env.NODE_ENV === 'development') {
  // Enable React strict mode
  const StrictApp = () => (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Check for required environment variables
  const requiredEnvVars = [
    'VITE_GITHUB_TOKEN',
    'VITE_GITHUB_OWNER',
    'VITE_GITHUB_REPO'
  ];

  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      console.warn(`Warning: Environment variable ${varName} is not set`);
    }
  });

  // Create root and render app
  const root = createRoot(document.getElementById('root'));
  root.render(<StrictApp />);

  // Enable hot module replacement
  if (import.meta.hot) {
    import.meta.hot.accept();
  }
} else {
  // Production rendering without strict mode
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
}

// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  try {
    // Example: Initialize performance monitoring services
    // Initialize web vitals reporting
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
  }
}

// Preload critical resources
const preloadResources = () => {
  const resources = [
    // Add critical resources here
    // Example: { href: '/fonts/Inter.woff2', as: 'font', type: 'font/woff2' }
  ];

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};

// Initialize preloading
preloadResources();

// Initialize analytics
initializeAnalytics({
  measurementId: process.env.VITE_GA_ID,
  siteId: process.env.VITE_PLAUSIBLE_ID,
  options: {
    cookieConsent: true,
    anonymizeIp: true
  }
});

// Export for testing purposes
export { reportWebVitals, logError };