import { Project, FilterOptions, CategoryStats, CATEGORY_COLORS, QUALITY_BANDS } from '../types';

export const filterProjects = (projects: Project[], filters: FilterOptions): Project[] => {
  return projects.filter(project => {
    // Category filter
    if (filters.category !== 'all' && project.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'live' && !project.is_live) return false;
      if (filters.status === 'error' && project.is_live) return false;
    }
    
    // Quality filter
    if (filters.quality !== 'all') {
      const qualityBand = getQualityBand(project.quality_score);
      if (qualityBand.label.toLowerCase() !== filters.quality) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        project.title,
        project.description,
        project.name,
        project.category
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchLower)) return false;
    }
    
    return true;
  });
};

export const getQualityBand = (score: number) => {
  return QUALITY_BANDS.find(band => 
    score >= band.min && score <= band.max
  ) || QUALITY_BANDS[2]; // fallback to low quality
};

export const getQualityColor = (score: number): string => {
  const band = getQualityBand(score);
  return band.color;
};

export const getCategoryStats = (projects: Project[]): CategoryStats[] => {
  const stats: Record<string, CategoryStats> = {};
  
  projects.forEach(project => {
    const category = project.category;
    
    if (!stats[category]) {
      stats[category] = {
        name: category,
        count: 0,
        liveCount: 0,
        avgQuality: 0,
        color: CATEGORY_COLORS[category] || '#6b7280'
      };
    }
    
    stats[category].count++;
    if (project.is_live) {
      stats[category].liveCount++;
    }
  });
  
  // Calculate average quality for each category
  Object.keys(stats).forEach(category => {
    const categoryProjects = projects.filter(p => p.category === category);
    const totalQuality = categoryProjects.reduce((sum, p) => sum + p.quality_score, 0);
    stats[category].avgQuality = Math.round(totalQuality / categoryProjects.length);
  });
  
  return Object.values(stats).sort((a, b) => b.count - a.count);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getProjectSuccessRate = (projects: Project[]): number => {
  const liveProjects = projects.filter(p => p.is_live).length;
  return Math.round((liveProjects / projects.length) * 100);
};

export const getAverageQuality = (projects: Project[]): number => {
  const totalQuality = projects.reduce((sum, p) => sum + p.quality_score, 0);
  return Math.round(totalQuality / projects.length);
};

export const sortProjects = (projects: Project[], sortBy: string): Project[] => {
  const sorted = [...projects];
  
  switch (sortBy) {
    case 'quality':
      return sorted.sort((a, b) => b.quality_score - a.quality_score);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'date':
      return sorted.sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime());
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return sorted;
  }
};

export const getTrendingCategories = (projects: Project[]): CategoryStats[] => {
  return getCategoryStats(projects)
    .filter(stat => stat.liveCount > 0)
    .sort((a, b) => (b.liveCount / b.count) - (a.liveCount / a.count))
    .slice(0, 5);
};

export const getRecentProjects = (projects: Project[], limit: number = 6): Project[] => {
  return projects
    .filter(p => p.is_live)
    .sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime())
    .slice(0, limit);
};

export const getHighQualityProjects = (projects: Project[], limit: number = 6): Project[] => {
  return projects
    .filter(p => p.is_live && p.quality_score >= 70)
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, limit);
};

export const getProjectUrl = (project: Project): string => {
  return project.github_url;
};

export const shortenDescription = (description: string, maxLength: number = 120): string => {
  if (description.length <= maxLength) return description;
  
  const shortened = description.substring(0, maxLength);
  const lastSpace = shortened.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? shortened.substring(0, lastSpace) + '...'
    : shortened + '...';
};

export const generateProjectSlug = (project: Project): string => {
  return project.name.toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getContestType = (project: Project): string => {
  const title = project.title.toLowerCase();
  const description = project.description.toLowerCase();
  const name = project.name.toLowerCase();
  
  const content = `${title} ${description} ${name}`;
  
  if (content.includes('공모전') || content.includes('contest')) return '공모전';
  if (content.includes('해커톤') || content.includes('hackathon')) return '해커톤';
  if (content.includes('아이디어') || content.includes('idea')) return '아이디어 공모';
  if (content.includes('정책') || content.includes('policy')) return '정책 제안';
  
  return '기타';
};

export const calculatePortfolioScore = (projects: Project[]): number => {
  const weights = {
    totalProjects: 0.2,
    liveRate: 0.3,
    avgQuality: 0.3,
    diversity: 0.2
  };
  
  const totalProjects = Math.min(projects.length / 50, 1) * 100; // Cap at 50 projects
  const liveRate = getProjectSuccessRate(projects);
  const avgQuality = getAverageQuality(projects);
  const diversity = Math.min(getCategoryStats(projects).length / 8, 1) * 100; // Cap at 8 categories
  
  return Math.round(
    totalProjects * weights.totalProjects +
    liveRate * weights.liveRate +
    avgQuality * weights.avgQuality +
    diversity * weights.diversity
  );
};
