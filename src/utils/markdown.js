import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { mangle } from 'marked-mangle';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import frontMatter from 'front-matter';
import { github } from './github';

/**
 * Markdown processor class
 */
class MarkdownProcessor {
  constructor(options = {}) {
    this.options = {
      baseUrl: '',
      imagePath: '',
      debug: false,
      ...options,
    };

    this.initializeMarked();
  }

  /**
   * Initialize marked with plugins and custom renderers
   */
  initializeMarked() {
    // Configure marked with plugins
    marked.use(
      gfmHeadingId(),
      mangle(),
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight: (code, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
              if (this.options.debug) {
                console.error('Highlight.js error:', err);
              }
            }
          }
          return hljs.highlightAuto(code).value;
        },
      }),
      {
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: true,
        pedantic: false,
        async: true,
      }
    );

    // Custom renderer
    const renderer = {
      // Custom image rendering with path resolution
      image: (href, title, text) => {
        const imageUrl = this.resolveImagePath(href);
        const titleAttr = title ? ` title="${title}"` : '';
        const altAttr = text ? ` alt="${text}"` : '';
        return `<img src="${imageUrl}"${titleAttr}${altAttr} loading="lazy" class="rounded-lg shadow-md" />`;
      },

      // Custom link rendering
      link: (href, title, text) => {
        const titleAttr = title ? ` title="${title}"` : '';
        const isExternal = href.startsWith('http');
        const externalAttrs = isExternal ? 
          ' target="_blank" rel="noopener noreferrer"' : '';
        const className = isExternal ? 
          'external-link' : 'internal-link';
        return `<a href="${href}"${titleAttr}${externalAttrs} class="${className}">${text}</a>`;
      },

      // Custom heading rendering with anchor links
      heading: (text, level, raw) => {
        const slug = this.slugify(raw);
        return `
          <h${level} id="${slug}" class="group">
            ${text}
            <a href="#${slug}" class="anchor-link opacity-0 group-hover:opacity-100 ml-2">
              #
            </a>
          </h${level}>
        `;
      },

      // Custom code block rendering
      code: (code, language) => {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const highlighted = hljs.highlight(code, { language: validLanguage }).value;
        return `
          <div class="code-block relative group">
            ${language ? `
              <div class="code-language absolute right-2 top-2 text-xs text-gray-500">
                ${language}
              </div>
            ` : ''}
            <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
            <button class="copy-button absolute right-2 bottom-2 opacity-0 group-hover:opacity-100">
              Copy
            </button>
          </div>
        `;
      },

      // Custom table rendering
      table: (header, body) => {
        return `
          <div class="table-wrapper overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">${header}</thead>
              <tbody class="divide-y divide-gray-200">${body}</tbody>
            </table>
          </div>
        `;
      },
    };

    marked.use({ renderer });
  }

  /**
   * Process markdown content with frontmatter
   */
  async process(content, options = {}) {
    try {
      // Parse frontmatter
      const { attributes, body } = frontMatter(content);
      
      // Process markdown content
      const htmlContent = await marked(body);

      // Extract table of contents
      const toc = this.generateTableOfContents(body);

      // Process metadata
      const metadata = await this.processMetadata(attributes);

      return {
        content: htmlContent,
        metadata,
        toc,
        excerpt: this.generateExcerpt(body),
        readingTime: this.calculateReadingTime(body),
      };
    } catch (error) {
      if (this.options.debug) {
        console.error('Markdown processing error:', error);
      }
      throw error;
    }
  }

  /**
   * Process metadata with additional enrichment
   */
  async processMetadata(metadata) {
    const enriched = {
      ...metadata,
      date: metadata.date ? new Date(metadata.date) : new Date(),
      tags: this.normalizeTags(metadata.tags),
      category: metadata.category || 'Uncategorized',
    };

    // Add reading time if not provided
    if (!enriched.readingTime && enriched.content) {
      enriched.readingTime = this.calculateReadingTime(enriched.content);
    }

    // Add excerpt if not provided
    if (!enriched.excerpt && enriched.content) {
      enriched.excerpt = this.generateExcerpt(enriched.content);
    }

    return enriched;
  }

  /**
   * Generate table of contents from markdown content
   */
  generateTableOfContents(content) {
    const headings = [];
    const tokens = marked.lexer(content);
    let currentLevel = 0;

    tokens.forEach(token => {
      if (token.type === 'heading') {
        const slug = this.slugify(token.text);
        const heading = {
          text: token.text,
          level: token.depth,
          slug,
          items: [],
        };

        if (token.depth === currentLevel) {
          headings.push(heading);
        } else if (token.depth > currentLevel) {
          const parent = headings[headings.length - 1];
          parent.items.push(heading);
        }

        currentLevel = token.depth;
      }
    });

    return headings;
  }

  /**
   * Generate excerpt from markdown content
   */
  generateExcerpt(content, length = 160) {
    // Remove frontmatter
    const { body } = frontMatter(content);
    
    // Convert markdown to plain text
    const text = body
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/[#*`]/g, '') // Remove markdown symbols
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Truncate to length
    return text.length > length 
      ? `${text.slice(0, length).trim()}...`
      : text;
  }

  /**
   * Calculate reading time in minutes
   */
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  }

  /**
   * Normalize tags array
   */
  normalizeTags(tags) {
    if (!tags) return [];
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim().toLowerCase());
    }
    if (Array.isArray(tags)) {
      return tags.map(tag => tag.trim().toLowerCase());
    }
    return [];
  }

  /**
   * Resolve image paths
   */
  resolveImagePath(src) {
    if (src.startsWith('http')) {
      return src;
    }

    if (src.startsWith('/')) {
      return `${this.options.baseUrl}${src}`;
    }

    return `${this.options.imagePath}/${src}`;
  }

  /**
   * Create URL-friendly slug
   */
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Process GitHub flavored markdown tasks
   */
  processTasks(content) {
    const tasks = [];
    const regex = /- \[(x| )\] (.+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      tasks.push({
        completed: match[1] === 'x',
        text: match[2],
        position: match.index,
      });
    }

    return tasks;
  }

  /**
   * Process markdown file from GitHub
   */
  async processGitHubFile(path) {
    try {
      const content = await github.getRawContent(path);
      return this.process(content);
    } catch (error) {
      if (this.options.debug) {
        console.error('GitHub markdown processing error:', error);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const markdown = new MarkdownProcessor({
  debug: process.env.NODE_ENV === 'development',
  baseUrl: process.env.VITE_BASE_URL || '',
  imagePath: process.env.VITE_IMAGE_PATH || '/images',
});

// Export class for custom instances
export { MarkdownProcessor };

export default markdown;