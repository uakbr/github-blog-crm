import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Replace 'your-repo-name' with your actual repository name
  base: '/github-blog-crm/',
  
  plugins: [
    react({
      // Enable JSX runtime
      jsxRuntime: 'automatic',
      // Add displayName in development
      babel: {
        plugins: [
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }],
          process.env.NODE_ENV !== 'production' && 'babel-plugin-transform-react-jsx-source',
        ].filter(Boolean),
      },
    }),
  ],

  resolve: {
    alias: {
      // Set up path aliases for cleaner imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  build: {
    // Output directory for production build
    outDir: 'dist',
    
    // Generate sourcemaps for production build
    sourcemap: true,
    
    // Optimize build
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          markdown: ['marked', 'marked-gfm-heading-id', 'marked-mangle'],
          ui: ['lucide-react', '@/components/ui'],
          analytics: ['web-vitals'],
          animation: ['framer-motion']
        },
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  server: {
    // Development server configuration
    port: 3000,
    open: true,
    cors: true,
    
    // Handle GitHub API proxy in development
    proxy: {
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/github/, ''),
      },
    },
  },

  preview: {
    // Preview server configuration
    port: 3000,
    open: true,
  },

  optimizeDeps: {
    // Include dependencies that need optimization
    include: [
      'react',
      'react-dom',
      'marked',
      'marked-gfm-heading-id',
      'marked-mangle',
      'lucide-react',
    ],
  },

  // Environment variable configuration
  envPrefix: 'APP_',
  
  // CSS configuration
  css: {
    modules: {
      // Generate scoped class names in development
      generateScopedName: process.env.NODE_ENV === 'development'
        ? '[name]__[local]__[hash:base64:5]'
        : '[hash:base64:8]',
    },
    
    // PostCSS configuration
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        process.env.NODE_ENV === 'production' && require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
          }],
        }),
      ].filter(Boolean),
    },
  },

  // Performance optimization
  esbuild: {
    jsxInject: `import React from 'react'`,
    target: 'es2020',
    legalComments: 'none',
    treeShaking: true,
  },
});