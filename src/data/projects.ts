import { ProjectsData } from '../types';
import projectsScanResult from './projects_scan_result.json';

// 실제 스캔 결과에서 라이브 프로젝트들만 필터링
const liveProjects = projectsScanResult.projects.filter(project => project.is_live);

// 카테고리별 통계 계산
const categoryStats: Record<string, number> = {};
liveProjects.forEach(project => {
  const category = project.category || '기타';
  categoryStats[category] = (categoryStats[category] || 0) + 1;
});

// 평균 품질 점수 계산
const totalQuality = liveProjects.reduce((sum, p) => sum + p.quality_score, 0);
const avgQuality = Math.round(totalQuality / liveProjects.length);

// 실제 프로젝트 데이터를 기반으로 한 포트폴리오 데이터
export const portfolioData: ProjectsData = {
  scan_info: projectsScanResult.scan_info,
  projects: liveProjects,
  statistics: {
    total_projects: projectsScanResult.projects.length,
    live_sites: liveProjects.length,
    has_readme: liveProjects.filter(p => p.has_readme).length,
    awarded_projects: liveProjects.filter(p => p.award_status !== 'unknown').length,
    categories: categoryStats,
    avg_quality_score: avgQuality
  }
};

export default portfolioData;
