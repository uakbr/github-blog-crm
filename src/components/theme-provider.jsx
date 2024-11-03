import React, { createContext, useContext, useEffect, useState } from 'react';

// Create theme context
const ThemeProviderContext = createContext({
  theme: 'system',
  setTheme: () => null,
  themes: ['light', 'dark', 'system'],
  systemTheme: 'light',
});

// Theme provider component
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  themes = ['light', 'dark', 'system'],
  attribute = 'data-theme',
  enableSystem = true,
  systemStorageKey = 'ui-theme-system',
  disableTransitionOnChange = false,
}) {
  // Get initial theme from localStorage or default
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Track system theme
  const [systemTheme, setSystemTheme] = useState('light');

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      if (theme === 'system') {
        document.documentElement.setAttribute(attribute, newSystemTheme);
        try {
          localStorage.setItem(systemStorageKey, newSystemTheme);
        } catch (error) {
          console.error('Failed to save system theme:', error);
        }
      }
    };

    // Initial setup
    handleChange();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, attribute, systemStorageKey]);

  // Theme setter function
  const setTheme = React.useCallback((newTheme) => {
    const resolvedTheme = newTheme === 'system' ? systemTheme : newTheme;
    
    // Disable transitions temporarily if specified
    if (disableTransitionOnChange) {
      document.documentElement.classList.add('disable-transitions');
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('disable-transitions');
      });
    }

    // Update theme
    document.documentElement.setAttribute(attribute, resolvedTheme);
    setThemeState(newTheme);

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, newTheme);
      if (newTheme === 'system') {
        localStorage.setItem(systemStorageKey, systemTheme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [attribute, storageKey, systemStorageKey, systemTheme, disableTransitionOnChange]);

  // Sync theme across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey) {
        setTheme(e.newValue || defaultTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setTheme, storageKey, defaultTheme]);

  // Apply initial theme
  useEffect(() => {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.setAttribute(attribute, resolvedTheme);
  }, [theme, systemTheme, attribute]);

  // Context value
  const value = {
    theme,
    setTheme,
    themes: enableSystem ? themes : themes.filter(t => t !== 'system'),
    systemTheme,
  };

  // Provider component
  return (
    <ThemeProviderContext.Provider value={value}>
      <ThemeScript
        {...{
          attribute,
          enableSystem,
          defaultTheme,
          storageKey,
          systemStorageKey,
        }}
      />
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Theme script component to prevent flash of wrong theme
const ThemeScript = ({
  attribute,
  enableSystem,
  defaultTheme,
  storageKey,
  systemStorageKey,
}) => {
  const themeScript = React.useMemo(() => {
    const script = `
      (function() {
        try {
          const getTheme = () => {
            const stored = localStorage.getItem('${storageKey}');
            if (stored) return stored;

            ${enableSystem ? `
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
              }
            ` : ''}

            return '${defaultTheme}';
          };

          const theme = getTheme();
          const root = document.documentElement;

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.setAttribute('${attribute}', systemTheme);
            localStorage.setItem('${systemStorageKey}', systemTheme);
          } else {
            root.setAttribute('${attribute}', theme);
          }
        } catch (e) {
          console.warn('Failed to set theme:', e);
        }
      })();
    `;

    return script.replace(/\s+/g, ' ').trim();
  }, [attribute, enableSystem, defaultTheme, storageKey, systemStorageKey]);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      nonce={typeof window !== 'undefined' ? window.__NONCE__ : undefined}
    />
  );
};

// Hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Performance optimization
export default React.memo(ThemeProvider);