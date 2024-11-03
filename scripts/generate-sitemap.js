const fs = require('fs').promises;
const path = require('path');
const glob = require('glob-promise');

async function generateSitemap() {
  try {
    const baseUrl = process.env.VITE_BASE_URL || 'https://example.com';
    
    // Get all HTML files from dist
    const htmlFiles = await glob('**/*.html', {
      cwd: path.join(process.cwd(), 'dist'),
    });

    // Get all markdown files (posts)
    const posts = JSON.parse(
      await fs.readFile('posts.json', 'utf-8')
    ).posts;

    // Create sitemap entries
    const entries = [
      // HTML pages
      ...htmlFiles.map(file => ({
        url: `${baseUrl}/${file}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: file === 'index.html' ? '1.0' : '0.8',
      })),
      
      // Blog posts
      ...posts.map(post => ({
        url: `${baseUrl}/posts/${post.path.replace(/\.md$/, '')}`,
        lastmod: post.lastModified,
        changefreq: 'monthly',
        priority: '0.6',
      })),
    ];

    // Add image sitemap support
    const imageEntries = [
      ...posts.map(post => ({
        url: `${baseUrl}/posts/${post.path.replace(/\.md$/, '')}`,
        images: post.images.map(img => ({
          loc: `${baseUrl}${img.path}`,
          title: img.alt || '',
          caption: img.caption || ''
        }))
      }))
    ];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    // Write sitemap to dist directory
    await fs.writeFile(
      path.join(process.cwd(), 'dist', 'sitemap.xml'),
      sitemap
    );

    console.log('✅ Sitemap generated successfully!');

    // Generate robots.txt with sitemap reference
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 10

# Disallow search-specific pages
Disallow: /search
Disallow: /api/
Disallow: /cdn-cgi/

# Additional rules for specific bots
User-agent: GPTBot
Disallow: /private/
Disallow: /drafts/

User-agent: ChatGPT-User
Disallow: /private/
Disallow: /drafts/

# Rate limiting directives
User-agent: *
Request-rate: 1/10
Visit-time: 0600-2100`;

    // Write robots.txt to dist directory
    await fs.writeFile(
      path.join(process.cwd(), 'dist', 'robots.txt'),
      robotsTxt
    );

    console.log('✅ robots.txt generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();