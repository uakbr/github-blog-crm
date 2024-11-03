import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';
import postcssNesting from 'postcss-nesting';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
  plugins: [
    // Import CSS files
    postcssImport({
      path: ['src/styles'],
    }),

    // Process Tailwind directives
    tailwindcss,

    // Enable CSS nesting
    postcssNesting,

    // Convert modern CSS into something most browsers can understand
    postcssPresetEnv({
      // Your customization options
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'custom-selectors': true,
        'gap-properties': true,
        'media-query-ranges': true,
        'color-functional-notation': true,
      },
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace',
      },
      browsers: [
        '>= 0.5%',
        'last 2 major versions',
        'not dead',
        'Chrome >= 60',
        'Firefox >= 60',
        'Firefox ESR',
        'iOS >= 12',
        'Safari >= 12',
        'not Explorer <= 11',
      ],
    }),

    // Add vendor prefixes
    autoprefixer({
      flexbox: 'no-2009',
      grid: 'autoplace',
    }),

    // Minify CSS in production
    process.env.NODE_ENV === 'production' &&
      cssnano({
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            colormin: true,
            minifyFontValues: true,
            minifyGradients: true,
            minifyParams: true,
            minifySelectors: true,
            minifyUrls: true,
            reduceIdents: true,
            reduceInitial: true,
            reduceTransforms: true,
            svgo: true,
            calc: true,
            orderValues: true,
            mergeLonghand: true,
            mergeRules: true,
            zindex: false, // Disable z-index optimization to prevent layout issues
          },
        ],
      }),
  ].filter(Boolean),
};