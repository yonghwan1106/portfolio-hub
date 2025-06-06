export interface Project {
  id: string;
  name: string;
  folder_path: string;
  scan_date: string;
  category: string;
  status: string;
  has_readme: boolean;
  has_proposal: boolean;
  has_website_folder: boolean;
  document_files: string[];
  title: string;
  description: string;
  contest_info: Record<string, any>;
  html_files: string[];
  github_url: string;
  is_live: boolean;
  response_code: number;
  has_mobile_responsive: boolean;
  estimated_quality: string;
  quality_score: number;
  award_status: string;
  has_title?: boolean;
  has_css?: boolean;
  has_js?: boolean;
  has_responsive?: boolean;
  content_length?: number;
}

export interface ProjectsData {
  scan_info: {
    scan_date: string;
    total_projects: number;
    scanner_version: string;
  };
  projects: Project[];
  statistics: {
    total_projects: number;
    live_sites: number;
    has_readme: number;
    awarded_projects: number;
    categories: Record<string, number>;
    avg_quality_score: number;
  };
}

export interface FilterOptions {
  category: string;
  status: 'all' | 'live' | 'error';
  quality: 'all' | 'high' | 'medium' | 'low';
  search: string;
}

export interface CategoryStats {
  name: string;
  count: number;
  liveCount: number;
  avgQuality: number;
  color: string;
}

export interface QualityBand {
  label: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export const QUALITY_BANDS: QualityBand[] = [
  {
    label: 'High',
    min: 70,
    max: 100,
    color: 'success',
    description: '우수한 품질의 프로젝트'
  },
  {
    label: 'Medium',
    min: 40,
    max: 69,
    color: 'yellow',
    description: '보통 품질의 프로젝트'
  },
  {
    label: 'Low',
    min: 0,
    max: 39,
    color: 'red',
    description: '개선이 필요한 프로젝트'
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  '기타': '#6b7280',
  '농업': '#10b981',
  '환경': '#059669',
  '규제혁신': '#dc2626',
  'AI/디지털': '#3b82f6',
  '관광': '#f59e0b',
  '안전': '#ef4444',
  '청년': '#8b5cf6'
};
