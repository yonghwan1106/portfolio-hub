import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { Project } from '../types';
import { getCategoryStats, getProjectSuccessRate, getAverageQuality } from '../utils';

interface StatsOverviewProps {
  projects: Project[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ projects }) => {
  const categoryStats = getCategoryStats(projects);
  const successRate = getProjectSuccessRate(projects);
  const averageQuality = getAverageQuality(projects);
  const totalProjects = projects.length;

  // 카테고리별 차트 데이터
  const categoryChartData = categoryStats.map(stat => ({
    name: stat.name,
    total: stat.count,
    live: stat.liveCount,
    quality: stat.avgQuality,
  }));

  // 품질 분포 데이터
  const qualityDistribution = [
    {
      name: '높음 (70+)',
      value: projects.filter(p => p.quality_score >= 70).length,
      color: '#10b981'
    },
    {
      name: '보통 (40-69)',
      value: projects.filter(p => p.quality_score >= 40 && p.quality_score < 70).length,
      color: '#f59e0b'
    },
    {
      name: '낮음 (0-39)',
      value: projects.filter(p => p.quality_score < 40).length,
      color: '#ef4444'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 요약 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">라이브: {projects.filter(p => p.is_live).length}개</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">성공률</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 품질</p>
              <p className="text-2xl font-bold text-gray-900">{averageQuality}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">100점 만점</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">카테고리</p>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">다양한 분야</span>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 카테고리별 프로젝트 현황 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">카테고리별 프로젝트 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#94a3b8" name="총 프로젝트" />
              <Bar dataKey="live" fill="#10b981" name="라이브 사이트" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 품질 분포 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">품질 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 상위 카테고리 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">카테고리별 상세 현황</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">카테고리</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">총 프로젝트</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">라이브 사이트</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">성공률</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">평균 품질</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat, index) => (
                <tr key={stat.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      {stat.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{stat.count}</td>
                  <td className="py-3 px-4">{stat.liveCount}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      (stat.liveCount / stat.count) >= 0.7 ? 'text-green-600' :
                      (stat.liveCount / stat.count) >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round((stat.liveCount / stat.count) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      stat.avgQuality >= 70 ? 'text-green-600' :
                      stat.avgQuality >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.avgQuality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
