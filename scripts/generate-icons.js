const { generateImages } = require('pwa-asset-generator');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  try {
    // Ensure icons directory exists
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    await fs.mkdir(iconsDir, { recursive: true });

    // Generate standard icons
    await generateImages(
      'src/assets/logo.svg', // Your source logo
      'public/icons',
      {
        scrape: false,
        background: '#ffffff',
        padding: '25%',
        manifest: 'public/site.webmanifest',
        index: 'index.html',
        favicon: true,
        mstile: true,
        androidChrome: true,
        appleMobile: true,
        maskable: true
      }
    );

    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();