import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  StarIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import apiService from '../services/api';

interface CourseStats {
  enrollmentCount: number;
  recentEnrollments: number;
  averageRating: number;
  totalReviews: number;
  popularityBadge: 'Trending' | 'Bestseller' | 'New' | null;
  lastUpdated: string;
  completionRate: number;
  level: string;
  duration: string;
}

interface CourseStatsDisplayProps {
  courseId: string;
  variant?: 'detailed' | 'compact' | 'inline';
  className?: string;
}

export default function CourseStatsDisplay({ 
  courseId, 
  variant = 'detailed',
  className = ''
}: CourseStatsDisplayProps) {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [courseId]);

  const fetchStats = async () => {
    try {
      const response = await apiService.getCoursePublicStats(courseId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch course stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!stats) return null;

  // Inline variant for course header (no cards, just inline badges)
  if (variant === 'inline') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Stats Row - Inline Display */}
        <div className="flex flex-wrap items-center gap-6 text-white">
          {/* Students */}
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-white/80" />
            <span className="font-semibold">
              {stats.enrollmentCount >= 1000 
                ? `${(stats.enrollmentCount / 1000).toFixed(1)}k` 
                : stats.enrollmentCount.toLocaleString()
              } Students
            </span>
            {stats.recentEnrollments > 0 && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                +{stats.recentEnrollments} this week
              </span>
            )}
          </div>

          {/* Rating */}
          {stats.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-white/70">({stats.totalReviews} reviews)</span>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-white/80" />
            <span className="font-semibold">{stats.duration}</span>
          </div>

          {/* Level */}
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-white/80" />
            <span className="font-semibold">{stats.level}</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-white/70">
          Last updated: {new Date(stats.lastUpdated).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>
    );
  }

  // Compact variant for course cards
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 text-sm ${className}`}>
        {/* Students Count */}
        <div className="flex items-center gap-1 text-gray-600">
          <UsersIcon className="h-4 w-4 text-primary" />
          <span className="font-medium">{stats.enrollmentCount.toLocaleString()}</span>
        </div>

        {/* Rating */}
        {stats.averageRating > 0 && (
          <div className="flex items-center gap-1 text-gray-600">
            <StarIcon className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
            <span className="text-gray-400">({stats.totalReviews})</span>
          </div>
        )}

        {/* Popularity Badge */}
        {stats.popularityBadge && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
            stats.popularityBadge === 'Trending' ? 'bg-orange-100 text-orange-700' :
            stats.popularityBadge === 'Bestseller' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {stats.popularityBadge === 'Trending' && '🔥'}
            {stats.popularityBadge === 'Bestseller' && '⭐'}
            {stats.popularityBadge === 'New' && '✨'}
            {stats.popularityBadge}
          </span>
        )}
      </div>
    );
  }

  // Detailed variant for course detail page header
  return (
    <div className={`${className}`}>
      {/* Inline Stats Display - Compact for Header */}
      <div className="flex flex-wrap items-center gap-6 text-white">
        {/* Popularity Badge */}
        {stats.popularityBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f4e500] text-dark rounded-lg font-bold shadow-md">
            {stats.popularityBadge === 'Trending' && '🔥'}
            {stats.popularityBadge === 'Bestseller' && '⭐'}
            {stats.popularityBadge === 'New' && '✨'}
            <span>{stats.popularityBadge}</span>
          </div>
        )}

        {/* Total Students */}
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          <span className="font-semibold">
            {stats.enrollmentCount >= 1000 
              ? `${(stats.enrollmentCount / 1000).toFixed(1)}k` 
              : stats.enrollmentCount.toLocaleString()
            } Students
          </span>
          {stats.recentEnrollments > 0 && (
            <span className="text-xs bg-green-500 px-2 py-1 rounded-full font-semibold">
              +{stats.recentEnrollments} this week
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span className="font-semibold">
            {stats.averageRating > 0 ? (
              <>
                {stats.averageRating.toFixed(1)}
                {stats.totalReviews > 0 && (
                  <span className="text-sm ml-1">({stats.totalReviews} reviews)</span>
                )}
              </>
            ) : (
              'New'
            )}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          <span className="font-semibold">{stats.duration}</span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5" />
          <span className="font-semibold">{stats.level}</span>
        </div>

        {/* Last Updated */}
        <div className="text-sm opacity-90">
          Last updated: {new Date(stats.lastUpdated).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}
