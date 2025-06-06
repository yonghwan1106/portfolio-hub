import React from 'react';
import { Search, Filter } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  totalCount: number;
  filteredCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  categories,
  totalCount,
  filteredCount,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, category: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value as FilterOptions['status'] });
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, quality: e.target.value as FilterOptions['quality'] });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      status: 'all',
      quality: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.category !== 'all' || 
                           filters.status !== 'all' || 
                           filters.quality !== 'all' || 
                           filters.search !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* 검색창 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* 필터들 */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">전체 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">전체 상태</option>
            <option value="live">라이브</option>
            <option value="error">오류</option>
          </select>

          <select
            value={filters.quality}
            onChange={handleQualityChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">전체 품질</option>
            <option value="high">높음 (70+)</option>
            <option value="medium">보통 (40-69)</option>
            <option value="low">낮음 (0-39)</option>
          </select>
        </div>

        {/* 필터 초기화 */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 결과 카운트 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>
            총 {totalCount}개 프로젝트 중 {filteredCount}개 표시
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                카테고리: {filters.category}
                <button
                  onClick={() => onFiltersChange({ ...filters, category: 'all' })}
                  className="ml-1 hover:text-primary-900"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                상태: {filters.status === 'live' ? '라이브' : '오류'}
                <button
                  onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                  className="ml-1 hover:text-primary-900"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.quality !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                품질: {filters.quality === 'high' ? '높음' : filters.quality === 'medium' ? '보통' : '낮음'}
                <button
                  onClick={() => onFiltersChange({ ...filters, quality: 'all' })}
                  className="ml-1 hover:text-primary-900"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                검색: "{filters.search}"
                <button
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  className="ml-1 hover:text-primary-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
