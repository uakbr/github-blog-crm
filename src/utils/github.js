import { retry } from '@/lib/utils';

// GitHub API base URLs
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

/**
 * GitHub API client class
 */
class GitHubClient {
  constructor(options = {}) {
    this.token = options.token || process.env.VITE_GITHUB_TOKEN;
    this.owner = options.owner || process.env.VITE_GITHUB_OWNER;
    this.repo = options.repo || process.env.VITE_GITHUB_REPO;
    this.branch = options.branch || 'main';
    this.debug = options.debug || false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Create headers for GitHub API requests
   */
  get headers() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Make API request with retries and error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
    
    // Check cache first
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await retry(
        async () => {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...this.headers,
              ...options.headers,
            },
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'GitHub API request failed');
          }

          return res;
        },
        3, // retry 3 times
        1000 // starting delay of 1s
      );

      const data = await response.json();
      
      // Cache the response
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      if (this.debug) {
        console.error('GitHub API request failed:', { url, options, error });
      }
      throw error;
    }
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Get repository content
   */
  async getRepositoryContent(path = '') {
    return this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`);
  }

  /**
   * Get repository tree
   */
  async getRepositoryTree(recursive = true) {
    return this.request(
      `/repos/${this.owner}/${this.repo}/git/trees/${this.branch}${recursive ? '?recursive=1' : ''}`
    );
  }

  /**
   * Get file content from raw GitHub URL
   */
  async getRawContent(path) {
    const url = `${GITHUB_RAW_BASE}/${this.owner}/${this.repo}/${this.branch}/${path}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch raw content: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get markdown files from repository
   */
  async getMarkdownFiles() {
    try {
      const tree = await this.getRepositoryTree();
      return tree.tree
        .filter(item => item.path.endsWith('.md'))
        .map(item => ({
          path: item.path,
          url: `${GITHUB_RAW_BASE}/${this.owner}/${this.repo}/${this.branch}/${item.path}`,
          sha: item.sha,
        }));
    } catch (error) {
      if (this.debug) {
        console.error('Failed to get markdown files:', error);
      }
      throw error;
    }
  }

  /**
   * Get file commit history
   */
  async getFileHistory(path) {
    return this.request(
      `/repos/${this.owner}/${this.repo}/commits?path=${path}`
    );
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo() {
    return this.request(`/repos/${this.owner}/${this.repo}`);
  }

  /**
   * Search repository content
   */
  async searchContent(query) {
    return this.request(
      `/search/code?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}`
    );
  }

  /**
   * Get repository branches
   */
  async getBranches() {
    return this.request(`/repos/${this.owner}/${this.repo}/branches`);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path) {
    try {
      const [content, history] = await Promise.all([
        this.getRepositoryContent(path),
        this.getFileHistory(path),
      ]);

      return {
        name: content.name,
        path: content.path,
        sha: content.sha,
        size: content.size,
        url: content.download_url,
        lastModified: history[0].commit.committer.date,
        lastModifiedBy: history[0].commit.committer.name,
        history: history.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.committer.date,
          author: commit.commit.author.name,
        })),
      };
    } catch (error) {
      if (this.debug) {
        console.error('Failed to get file metadata:', error);
      }
      throw error;
    }
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats() {
    const [repo, tree] = await Promise.all([
      this.getRepositoryInfo(),
      this.getRepositoryTree(),
    ]);

    const markdownFiles = tree.tree.filter(item => item.path.endsWith('.md'));

    return {
      totalFiles: tree.tree.length,
      markdownFiles: markdownFiles.length,
      lastUpdated: repo.updated_at,
      size: repo.size,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
      hasWiki: repo.has_wiki,
      hasPages: repo.has_pages,
      forksCount: repo.forks_count,
      stargazersCount: repo.stargazers_count,
      watchersCount: repo.watchers_count,
    };
  }

  /**
   * Check if path exists in repository
   */
  async pathExists(path) {
    try {
      await this.getRepositoryContent(path);
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimit() {
    return this.request('/rate_limit');
  }
}

// Export singleton instance
export const github = new GitHubClient({
  debug: process.env.NODE_ENV === 'development',
});

// Export class for custom instances
export { GitHubClient };

// Export utility functions
export const utils = {
  /**
   * Parse GitHub URL into owner and repo
   */
  parseGitHubUrl(url) {
    try {
      const parsed = new URL(url);
      const [, owner, repo] = parsed.pathname.split('/');
      return { owner, repo };
    } catch {
      return null;
    }
  },

  /**
   * Generate raw content URL
   */
  getRawUrl(owner, repo, branch, path) {
    return `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${path}`;
  },

  /**
   * Check if URL is a GitHub URL
   */
  isGitHubUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'github.com';
    } catch {
      return false;
    }
  },
};

export default github;