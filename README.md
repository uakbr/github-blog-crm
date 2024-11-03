# Modern GitHub Pages Blog CRM

A powerful, modern blog CRM system that uses your GitHub repository's markdown files as content. Built with React, Vite, TailwindCSS, and shadcn/ui components, this system automatically converts your repository's markdown files into a beautiful, responsive blog with a full-featured CRM interface.

![Blog CRM Screenshot](docs/screenshots/dashboard.png)

## ✨ Features

### 📝 Content Management
- Automatic markdown file detection and parsing
- YAML frontmatter support
- Category and tag organization
- Full-text search capabilities
- Table of contents generation
- Custom metadata support

### 🎨 Design & UI
- Beautiful, responsive design
- Light/dark mode support
- Mobile-first approach
- Smooth animations and transitions
- Grid and list view options
- Customizable themes

### 📱 Responsive Features
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Mobile navigation
- Responsive typography
- Optimized images

### 🚀 Performance
- Static site generation
- Optimized builds
- Lazy loading
- Image optimization
- SEO-friendly

### 🔒 Security
- GitHub-based authentication
- Secure content hosting
- No database required
- Version control for all content

## 📁 Project Structure

```
github-blog-crm/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment workflow
├── public/
│   ├── fonts/                      # Custom fonts
│   └── images/                     # Static images
├── src/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── alert.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   └── ...
│   │   ├── BlogCRM.jsx            # Main CRM component
│   │   ├── Header.jsx             # App header
│   │   ├── PostCard.jsx           # Post preview card
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   └── TableOfContents.jsx    # Post ToC component
│   ├── styles/
│   │   ├── globals.css            # Global styles
│   │   └── markdown.css           # Markdown-specific styles
│   ├── utils/
│   │   ├── github.js              # GitHub API utilities
│   │   ├── markdown.js            # Markdown processing
│   │   └── theme.js               # Theme utilities
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
├── .gitignore
├── index.html                     # HTML template
├── package.json
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind configuration
└── vite.config.js                 # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Git
- GitHub account
- GitHub repository for your blog

### Installation

1. Clone this repository or use it as a template:
```bash
git clone https://github.com/yourusername/github-blog-crm.git
cd github-blog-crm
```

2. Install dependencies:
```bash
npm install
```

3. Update the GitHub configuration:

In `src/components/BlogCRM.jsx`:
```javascript
const owner = 'YOUR_GITHUB_USERNAME';
const repo = 'YOUR_REPO_NAME';
const branch = 'main';  // or your default branch name
```

4. Update the Vite configuration:

In `vite.config.js`:
```javascript
export default defineConfig({
  base: '/your-repo-name/',  // Replace with your repository name
})
```

### 📝 Writing Blog Posts

Create markdown files in your repository with frontmatter:

```markdown
---
title: Your Post Title
date: 2024-03-01
category: Technology
tags: react, javascript, web development
author: Your Name
excerpt: A brief description of your post
image: /images/cover.jpg
---

Your markdown content here...
```

#### Supported Frontmatter Fields

| Field    | Required | Description                          | Default               |
|----------|----------|--------------------------------------|----------------------|
| title    | No       | Post title                          | Filename without .md |
| date     | No       | Publication date                     | Current date        |
| category | No       | Post category                        | "Uncategorized"     |
| tags     | No       | Comma-separated list of tags         | []                  |
| author   | No       | Post author                          | "Unknown"           |
| excerpt  | No       | Brief description for post previews  | ""                  |
| image    | No       | Cover image path                     | null                |

### 🖼️ Images

Include images using standard markdown syntax:

```markdown
![Alt text](path/to/image.jpg)
```

Supported image paths:
- Relative: `images/photo.jpg`
- Repository root: `/images/photo.jpg`
- Full URLs: `https://example.com/image.jpg`

### 🚀 Deployment

1. Enable GitHub Pages:
   - Go to repository settings
   - Navigate to Pages
   - Select "GitHub Actions" as source

2. Push your changes:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 💻 Local Development

1. Start development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Preview production build:
```bash
npm run preview
```

## 🎨 Customization

### Themes

Modify theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your custom colors
        }
      }
    }
  }
}
```

### Components

Add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

## 📚 Markdown Features

Supported markdown features:
- GitHub Flavored Markdown (GFM)
- Syntax highlighting
- Task lists
- Tables
- Footnotes
- Auto-linked references
- Heading IDs
- Image optimization
- HTML embedding

## 🔧 Advanced Configuration

### Environment Variables

Create `.env` file:
```env
GITHUB_TOKEN=your_token_here
BASE_URL=your_base_url
```

### Custom Domains

1. Create `CNAME` file in `/public`
2. Add your domain
3. Update DNS settings

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check GitHub Actions logs
   - Verify dependencies
   - Confirm repository permissions

2. **Content Not Updating**
   - Clear browser cache
   - Check GitHub API rate limits
   - Verify file paths

3. **Styling Issues**
   - Check browser console
   - Verify CSS compilation
   - Clear PostCSS cache

## 📖 Documentation

- [Component Documentation](docs/components.md)
- [API Reference](docs/api.md)
- [Styling Guide](docs/styling.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write tests for new features
- Update documentation
- Follow code style guidelines

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Components from [shadcn/ui](https://ui.shadcn.com/)
- Markdown parsing by [marked](https://marked.js.org/)