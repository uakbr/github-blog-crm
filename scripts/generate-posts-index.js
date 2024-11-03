const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob-promise');

async function generatePostsIndex() {
  try {
    // Get all markdown files from posts and content directories
    const files = await glob('**/*.md', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', 'dist/**']
    });

    const posts = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        const { data: frontmatter, excerpt } = matter(content, {
          excerpt: true,
          excerpt_separator: '<!--more-->'
        });

        // Get file stats
        const stats = await fs.stat(file);

        return {
          path: file,
          title: frontmatter.title || path.basename(file, '.md'),
          date: frontmatter.date || stats.birthtime,
          lastModified: stats.mtime,
          category: frontmatter.category || 'Uncategorized',
          tags: frontmatter.tags || [],
          author: frontmatter.author,
          draft: frontmatter.draft || false,
          excerpt: excerpt || '',
          frontmatter
        };
      })
    );

    // Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate metadata
    const metadata = {
      totalPosts: posts.length,
      categories: [...new Set(posts.map(post => post.category))],
      tags: [...new Set(posts.flatMap(post => post.tags))],
      authors: [...new Set(posts.map(post => post.author).filter(Boolean))],
      lastUpdated: new Date().toISOString(),
    };

    // Write to posts.json
    await fs.writeFile(
      'posts.json',
      JSON.stringify(
        {
          metadata,
          posts
        },
        null,
        2
      )
    );

    console.log('Posts index generated successfully!');
    console.log(`Total posts: ${metadata.totalPosts}`);
    console.log(`Categories: ${metadata.categories.length}`);
    console.log(`Tags: ${metadata.tags.length}`);

  } catch (error) {
    console.error('Error generating posts index:', error);
    process.exit(1);
  }
}

generatePostsIndex();