import { useState, useMemo } from 'react';
import { BarChart3, Grid, Award, Search } from 'lucide-react';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import FilterBar from './components/FilterBar';
import StatsOverview from './components/StatsOverview';
import { FilterOptions } from './types';
import { filterProjects, getHighQualityProjects, sortProjects } from './utils';
// import portfolioData from './data/projects';
import portfolioDataJson from './data/projects_scan_result.json';

type ViewMode = 'projects' | 'stats';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    quality: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<string>('quality');

  // 프로젝트 필터링 및 정렬
  const filteredProjects = useMemo(() => {
    const filtered = filterProjects(portfolioDataJson.projects, filters);
    return sortProjects(filtered, sortBy);
  }, [filters, sortBy]);

  // 카테고리 목록
  const categories = useMemo(() => {
    return Array.from(new Set(portfolioDataJson.projects.map(p => p.category))).sort();
  }, []);

  // 추천 프로젝트 (높은 품질)
  const featuredProjects = useMemo(() => {
    return getHighQualityProjects(portfolioDataJson.projects, 3);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* 네비게이션 탭 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('projects')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'projects'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
              프로젝트 ({portfolioDataJson.projects.length})
            </button>
            
            <button
              onClick={() => setViewMode('stats')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'stats'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              통계 분석
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {viewMode === 'projects' ? (
          <div>
            {/* 추천 프로젝트 섹션 */}
            {featuredProjects.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">추천 프로젝트</h2>
                  <span className="text-sm text-gray-500">높은 품질의 프로젝트들</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} featured />
                  ))}
                </div>
              </section>
            )}

            {/* 필터 바 */}
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              totalCount={portfolioDataJson.projects.length}
              filteredCount={filteredProjects.length}
            />

            {/* 정렬 옵션 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                전체 프로젝트
              </h2>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="quality">품질순</option>
                <option value="date">최신순</option>
                <option value="name">이름순</option>
                <option value="category">카테고리순</option>
              </select>
            </div>

            {/* 프로젝트 그리드 */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색어나 필터를 시도해보세요.
                </p>
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    status: 'all',
                    quality: 'all',
                    search: ''
                  })}
                  className="mt-4 btn-primary"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">통계 분석</h2>
              <p className="text-gray-600">
                포트폴리오 프로젝트들의 상세한 분석과 통계를 확인하세요.
              </p>
            </div>
            
            <StatsOverview projects={portfolioDataJson.projects} />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              © 2025 박용환. 아이디어를 현실로 만드는 공모전 전문가.
            </p>
            <p className="text-sm text-gray-500">
              📧 sanoramyun8@gmail.com | 📱 010-7939-3123 | 🏢 크리에이티브 넥서스
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
              <span>총 {portfolioDataJson.projects.length}개 프로젝트</span>
              <span>•</span>
              <span>{portfolioDataJson.projects.filter(p => p.is_live).length}개 라이브 사이트</span>
              <span>•</span>
              <span>평균 품질 {Math.round(portfolioDataJson.projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / portfolioDataJson.projects.length)}점</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
