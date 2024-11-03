import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Settings,
  Sun,
  Moon,
  Layout,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Calendar,
  Tag,
  Folder,
  FileText,
  Eye,
  Clock,
  Star,
  Share2,
  Trash2,
  Plus,
  X,
  ArrowUpRight,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';

import { getMarkdownFiles, getRawContent, getFileMetadata } from '@/utils/github';
import { processMarkdown } from '@/utils/markdown';
import { cn, formatDate, truncate } from '@/lib/utils';

// Animation variants for various components
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 },
  },
};

// Post sorting options
const sortOptions = {
  'date-desc': { label: 'Newest First', icon: SortDesc },
  'date-asc': { label: 'Oldest First', icon: SortAsc },
  'title-asc': { label: 'Title A-Z', icon: SortAsc },
  'title-desc': { label: 'Title Z-A', icon: SortDesc },
  'views-desc': { label: 'Most Viewed', icon: Eye },
  'views-asc': { label: 'Least Viewed', icon: Eye },
};

// View modes
const viewModes = {
  grid: { label: 'Grid View', icon: Grid },
  list: { label: 'List View', icon: List },
  compact: { label: 'Compact View', icon: Layout },
};

// Theme settings
const themeSettings = {
  light: { label: 'Light Mode', icon: Sun },
  dark: { label: 'Dark Mode', icon: Moon },
  system: { label: 'System Theme', icon: Settings },
};

// Initial state for filters
const initialFilters = {
  categories: [],
  tags: [],
  dateRange: null,
  searchTerm: '',
  status: 'all',
};

/**
 * BlogCRM Component
 * 
 * A comprehensive CRM for managing blog posts from GitHub repositories
 * with features like filtering, sorting, theming, and responsive design.
 */
const BlogCRM = () => {
  // State management
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    categories: 0,
    tags: 0,
  });

  // Refs
  const searchInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const lastScrollPosition = useRef(0);

  // Hooks
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Data Fetching
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all markdown files from the repository
      const files = await getMarkdownFiles();
      
      // Process each file
      const postsData = await Promise.all(
        files.map(async (file) => {
          try {
            const content = await getRawContent(file.path);
            const processed = await processMarkdown(content);
            
            // Get file metadata from GitHub
            const metadata = await getFileMetadata(file.path);
            
            return {
              id: file.sha,
              path: file.path,
              content: processed.content,
              metadata: {
                ...processed.metadata,
                ...metadata,
                lastModified: metadata.lastModified,
                author: metadata.lastModifiedBy,
              },
              toc: processed.toc,
              excerpt: processed.excerpt,
              readingTime: processed.readingTime,
            };
          } catch (error) {
            console.error(`Error processing ${file.path}:`, error);
            return null;
          }
        })
      );

      // Filter out failed processing
      const validPosts = postsData.filter(Boolean);
      
      // Update posts state
      setPosts(validPosts);
      
      // Extract and set categories and tags
      const allCategories = new Set(validPosts.map(post => post.metadata.category));
      const allTags = new Set(validPosts.flatMap(post => post.metadata.tags));
      
      setCategories(Array.from(allCategories));
      setTags(Array.from(allTags));
      
      // Update stats
      setStats({
        total: validPosts.length,
        published: validPosts.filter(post => !post.metadata.draft).length,
        drafts: validPosts.filter(post => post.metadata.draft).length,
        categories: allCategories.size,
        tags: allTags.size,
      });

      // Show success toast
      toast({
        title: "Posts Updated",
        description: `Successfully loaded ${validPosts.length} posts`,
      });

    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter and Sort Logic
  const filterPosts = useCallback(() => {
    if (!posts.length) return;

    let filtered = [...posts];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.metadata.title.toLowerCase().includes(searchLower) ||
        post.metadata.category.toLowerCase().includes(searchLower) ||
        post.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.excerpt.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length) {
      filtered = filtered.filter(post =>
        filters.categories.includes(post.metadata.category)
      );
    }

    // Tags filter
    if (filters.tags.length) {
      filtered = filtered.filter(post =>
        filters.tags.some(tag => post.metadata.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(post => {
        const postDate = new Date(post.metadata.date);
        return postDate >= start && postDate <= end;
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(post =>
        filters.status === 'draft' ? post.metadata.draft : !post.metadata.draft
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.metadata.date) - new Date(a.metadata.date);
        case 'date-asc':
          return new Date(a.metadata.date) - new Date(b.metadata.date);
        case 'title-asc':
          return a.metadata.title.localeCompare(b.metadata.title);
        case 'title-desc':
          return b.metadata.title.localeCompare(a.metadata.title);
        case 'views-desc':
          return (b.metadata.views || 0) - (a.metadata.views || 0);
        case 'views-asc':
          return (a.metadata.views || 0) - (b.metadata.views || 0);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, filters, sortBy]);

  // Update filtered posts when filters or sort changes
  useEffect(() => {
    filterPosts();
  }, [filterPosts, posts, filters, sortBy]);

  // Search handling with debounce
  const handleSearch = useMemo(
    () =>
      debounce((term) => {
        setFilters((prev) => ({ ...prev, searchTerm: term }));
      }, 300),
    []
  );

  // Filter updates
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSortBy('date-desc');
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    });
  }, [toast]);

  // Handle post selection
  const handlePostSelect = useCallback((post) => {
    setSelectedPost(post);
    // Update view count
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, metadata: { ...p.metadata, views: (p.metadata.views || 0) + 1 } }
          : p
      )
    );
    // Scroll to top with smooth animation
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle post deselection
  const handlePostDeselect = useCallback(() => {
    // Store current scroll position
    lastScrollPosition.current = mainContentRef.current?.scrollTop || 0;
    setSelectedPost(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close search or deselect post
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (selectedPost) {
          handlePostDeselect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSearchOpen, selectedPost, handlePostDeselect]);

  // Render Sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Blog CRM</h2>
        <p className="text-sm text-muted-foreground">
          {stats.total} posts • {stats.published} published
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{stats.categories}</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Tags</p>
          <p className="text-2xl font-bold">{stats.tags}</p>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Categories Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => updateFilters({ 
                    categories: filters.categories.includes(category)
                      ? filters.categories.filter(c => c !== category)
                      : [...filters.categories, category]
                  })}
                  className={cn(
                    "w-full text-left px-2 py-1 rounded text-sm",
                    filters.categories.includes(category)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => updateFilters({
                    tags: filters.tags.includes(tag)
                      ? filters.tags.filter(t => t !== tag)
                      : [...filters.tags, tag]
                  })}
                  className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    filters.tags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : null
                  }
                })}
              />
              <Input
                type="date"
                value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : null
                  }
                })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status</h3>
            <div className="flex gap-2">
              {['all', 'published', 'draft'].map(status => (
                <button
                  key={status}
                  onClick={() => updateFilters({ status })}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs capitalize",
                    filters.status === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {(filters.categories.length > 0 || 
            filters.tags.length > 0 || 
            filters.dateRange || 
            filters.status !== 'all') && (
            <Button
              variant="outline"
              className="w-full"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(
              theme === 'light' ? 'dark' : 'light'
            )}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="left" className="w-[300px] p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );

  // Command Menu for Search
  const CommandMenu = () => (
    <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <CommandInput placeholder="Search posts..." />
      <CommandList>
        <CommandEmpty>No posts found.</CommandEmpty>
        {filteredPosts.map(post => (
          <CommandItem
            key={post.id}
            onSelect={() => {
              handlePostSelect(post);
              setIsSearchOpen(false);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            {post.metadata.title}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );

  // Post Card Component
  const PostCard = ({ post, view = 'grid' }) => {
    const date = new Date(post.metadata.date);
    
    if (view === 'compact') {
      return (
        <motion.div
          layout
          layoutId={post.id}
          className="p-2 hover:bg-accent rounded-lg cursor-pointer"
          onClick={() => handlePostSelect(post)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{post.metadata.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(date, 'short')}
            </span>
          </div>
        </motion.div>
      );
    }

    if (view === 'list') {
      return (
        <motion.div
          layout
          layoutId={post.id}
          className="group relative p-4 hover:bg-accent rounded-lg cursor-pointer"
          onClick={() => handlePostSelect(post)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium leading-none">{post.metadata.title}</h3>
                {post.metadata.draft && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(date)}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.readingTime} min read
                </span>
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {post.metadata.views || 0} views
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites logic
                      }}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to favorites</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      );
    }

    // Grid view (default)
    return (
      <motion.div
        layout
        layoutId={post.id}
        className="group relative"
      >
        <Card 
          className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
          onClick={() => handlePostSelect(post)}
        >
          {/* Preview image or gradient placeholder */}
          <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5">
            {post.metadata.image ? (
              <img
                src={post.metadata.image}
                alt={post.metadata.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/20">
                <FileText className="h-12 w-12" />
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="font-medium leading-none line-clamp-2">
                  {post.metadata.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
              
              {/* Tags */}
              {post.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.metadata.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-muted rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.metadata.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                      +{post.metadata.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(date)}
                </span>
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {post.metadata.views || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1 bg-background/80 backdrop-blur-sm rounded-full p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favorites logic
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to favorites</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  };

  // Post View Component
  const PostView = ({ post }) => {
    const [isTocOpen, setIsTocOpen] = useState(false);
    const contentRef = useRef(null);
    
    // Track active TOC section
    const [activeSection, setActiveSection] = useState('');
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { threshold: 0.5 }
      );

      if (contentRef.current) {
        const headings = contentRef.current.querySelectorAll('h1, h2, h3');
        headings.forEach((heading) => observer.observe(heading));
      }

      return () => observer.disconnect();
    }, [post]);

    return (
      <div className="relative max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handlePostDeselect}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to posts
        </Button>

        <div className="space-y-8">
          {/* Post Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold">{post.metadata.title}</h1>
              {post.metadata.draft && (
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-sm">
                  Draft
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.metadata.date)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.readingTime} min read
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.metadata.views || 0} views
              </span>
            </div>

            {post.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.excerpt && (
              <p className="text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Content with TOC */}
          <div className="relative flex gap-8">
            {/* Main content */}
            <div 
              ref={contentRef}
              className="prose prose-lg dark:prose-invert max-w-none flex-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Table of Contents (desktop) */}
            {post.toc.length > 0 && (
              <div className="hidden lg:block w-64 sticky top-4 self-start">
                <div className="space-y-2">
                  <h4 className="font-medium">Table of Contents</h4>
                  <nav className="space-y-1">
                    {post.toc.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.slug}`}
                        className={cn(
                          "block text-sm py-1 px-2 rounded hover:bg-accent",
                          item.level === 2 && "pl-4",
                          item.level === 3 && "pl-6",
                          activeSection === item.slug && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Table of Contents (mobile) */}
            {post.toc.length > 0 && (
              <Sheet open={isTocOpen} onOpenChange={setIsTocOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="fixed bottom-4 right-4 lg:hidden"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Contents
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Table of Contents</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 space-y-1">
                    {post.toc.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.slug}`}
                        onClick={() => setIsTocOpen(false)}
                        className={cn(
                          "block text-sm py-1 px-2 rounded hover:bg-accent",
                          item.level === 2 && "pl-4",
                          item.level === 3 && "pl-6"
                        )}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r transition-transform lg:translate-x-0 z-30",
          isSidebarOpen ? "w-64" : "w-16",
          !isSidebarOpen && "lg:hover:w-64"
        )}
      >
        {isSidebarOpen ? (
          <SidebarContent />
        ) : (
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Command Menu */}
      <CommandMenu />

      {/* Main Content */}
      <main
        ref={mainContentRef}
        className={cn(
          "min-h-screen transition-[margin]",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-4">
              <Button
                variant="outline"
                className="hidden lg:flex gap-2"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                Search
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              <Button
                variant="outline"
                className="lg:hidden"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ViewToggle />
              <SortToggle />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            // Error state
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-destructive mb-4">
                  <XCircle className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Error Loading Posts</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchPosts}>Try Again</Button>
              </CardContent>
            </Card>
          ) : selectedPost ? (
            // Post view
            <PostView post={selectedPost} />
          ) : (
            // Posts grid/list
            <div>
              {/* Active filters summary */}
              {(filters.categories.length > 0 ||
                filters.tags.length > 0 ||
                filters.dateRange ||
                filters.status !== 'all') && (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Filtered by:</span>
                  {filters.categories.length > 0 && (
                    <Badge variant="secondary">
                      {filters.categories.length} categories
                    </Badge>
                  )}
                  {filters.tags.length > 0 && (
                    <Badge variant="secondary">
                      {filters.tags.length} tags
                    </Badge>
                  )}
                  {filters.dateRange && (
                    <Badge variant="secondary">Date range</Badge>
                  )}
                  {filters.status !== 'all' && (
                    <Badge variant="secondary" className="capitalize">
                      {filters.status}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Posts grid */}
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                  viewMode === 'list' && "grid-cols-1",
                  viewMode === 'compact' && "grid-cols-1 gap-1"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      view={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No posts found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogCRM;
