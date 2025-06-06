import React from 'react';
import { ExternalLink, Award, Code, Smartphone, Star } from 'lucide-react';
import { Project } from '../types';
import { getQualityColor, shortenDescription } from '../utils';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, featured = false }) => {
  const qualityColor = getQualityColor(project.quality_score);
  const cardClass = featured 
    ? 'project-card border-primary-200 bg-gradient-to-br from-white to-blue-50'
    : 'project-card';

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <Star className="w-4 h-4 text-yellow-500 fill-current" />;
    if (score >= 60) return <Star className="w-4 h-4 text-yellow-400" />;
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '농업': 'bg-green-100 text-green-800',
      '환경': 'bg-emerald-100 text-emerald-800',
      '규제혁신': 'bg-red-100 text-red-800',
      'AI/디지털': 'bg-blue-100 text-blue-800',
      '관광': 'bg-yellow-100 text-yellow-800',
      '안전': 'bg-red-100 text-red-800',
      '청년': 'bg-purple-100 text-purple-800',
      '지자체': 'bg-gray-100 text-gray-800',
      '문화': 'bg-pink-100 text-pink-800',
      '기타': 'bg-gray-100 text-gray-600'
    };
    return colors[category] || colors['기타'];
  };

  return (
    <div className={cardClass}>
      {featured && (
        <div className="absolute -top-2 -right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Featured
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
              {project.category}
            </span>
            <span className="status-live">
              ● Live
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {project.title || project.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <div className={`text-${qualityColor}-600 font-medium text-sm flex items-center gap-1`}>
            {getQualityIcon(project.quality_score)}
            {project.quality_score}
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {shortenDescription(project.description)}
      </p>

      {/* 기술 스택 표시 */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
        {project.has_css && (
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            CSS
          </div>
        )}
        {project.has_js && (
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            JS
          </div>
        )}
        {project.has_responsive && (
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            반응형
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {new Date(project.scan_date).toLocaleDateString('ko-KR')}
        </div>
        
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium"
        >
          <span>사이트 보기</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* 수상 정보가 있다면 표시 */}
      {project.award_status !== 'unknown' && project.award_status && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
            <Award className="w-4 h-4" />
            {project.award_status}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
