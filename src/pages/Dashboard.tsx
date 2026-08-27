import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PremiumModal from '../components/PremiumModal';
import api from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Play,
  Loader,
  BarChart3,
  Target,
  Lock
} from 'lucide-react';
import { usePremium } from '../context/PremiumContext';
import PremiumService, { PricingData } from '../services/premiumService';

interface Chapter {
  id: number;
  title: string;
  description: string;
  chapter_number: number;
  progress_percentage: number;
  status: string;
  slides_count: number;
  completed_slides: number;
  is_premium: boolean;
  publish_at?: string | null;
  is_scheduled?: boolean;
}

interface Progress {
  total_chapters: number;
  completed_chapters: number;
  total_slides: number;
  completed_slides: number;
  total_quizzes: number;
  passed_quizzes: number;
  slide_progress: number;
  quiz_progress: number;
  overall_progress: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLockedChapter, setSelectedLockedChapter] = useState<Chapter | null>(null);

  // Fetch chapters with React Query
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await api.get('/chapters');
      return response.data.chapters || [];
    },
    staleTime: 60 * 1000,
  });

  // Fetch progress with React Query
  const { data: progress = null, isLoading: progressLoading } = useQuery<Progress | null>({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const response = await api.get('/user/progress');
      return response.data.statistics || null;
    },
    staleTime: 60 * 1000,
  });

  // Fetch pricing with React Query
  const { data: pricing } = useQuery<PricingData>({
    queryKey: ['pricing'],
    queryFn: async () => {
      const response = await PremiumService.getPricing();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: {
      currency: 'EGP',
      currency_symbol: 'EGP',
      original_price: 500,
      discounted_price: 300,
      discount_percentage: 40,
      duration_days: 30,
      description: 'Get full access to all premium content for 30 days',
      formatted: {
        original_price: 'EGP 500',
        discounted_price: 'EGP 300',
      },
    },
  });

  const loading = chaptersLoading || progressLoading;

  const handleChapterClick = (chapter: Chapter) => {
    const isLocked = chapter.is_premium && !isPremium;

    if (isLocked) {
      setSelectedLockedChapter(chapter);
      setShowPremiumModal(true);
    } else {
      navigate(`/chapter/${chapter.id}/slides`);
    }
  };

  const getStatusColor = (status: string, isScheduled?: boolean) => {
    if (isScheduled) {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    }
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: string, isScheduled?: boolean) => {
    if (isScheduled) {
      return 'Coming Soon';
    }
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  // Show skeleton while loading
  if (loading || premiumLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <TopBar title="Dashboard" subtitle="Track your learning progress" />
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <TopBar title="Dashboard" subtitle="Track your learning progress" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Progress Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {/* Overall Progress */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <TrendingUp size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">{progress?.overall_progress}%</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium opacity-90">Overall Progress</h3>
            </div>

            {/* Chapters */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <BookOpen size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">{progress?.completed_chapters}/{progress?.total_chapters}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium opacity-90">Chapters Completed</h3>
            </div>

            {/* Slides */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <CheckCircle size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">{progress?.completed_slides}/{progress?.total_slides}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium opacity-90">Slides Completed</h3>
            </div>

            {/* Quizzes */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <Award size={24} className="sm:w-8 sm:h-8" />
                <span className="text-2xl sm:text-3xl font-bold">{progress?.passed_quizzes}/{progress?.total_quizzes}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium opacity-90">Quizzes Passed</h3>
            </div>
          </div>

          {/* Weighted Progress Bars */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="sm:w-6 sm:h-6" />
              Progress Breakdown
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Slides Progress (60%) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle size={16} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm sm:text-base font-medium text-gray-700">Slides Progress</span>
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">(60% weight)</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{progress?.slide_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.slide_progress}%` }}
                  />
                </div>
              </div>

              {/* Quiz Progress (40%) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Target size={16} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm sm:text-base font-medium text-gray-700">Quiz Progress</span>
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">(40% weight)</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{progress?.quiz_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.quiz_progress}%` }}
                  />
                </div>
              </div>

              {/* Overall Progress */}
              <div className="pt-3 sm:pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <TrendingUp size={16} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm sm:text-base font-bold text-gray-900">Overall Progress</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-blue-600">{progress?.overall_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.overall_progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Your Chapters</h2>

            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No chapters available</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {chapters.map((chapter) => {
                  const isLocked = chapter.is_premium && !isPremium;
                  const isScheduled = chapter.is_scheduled || false;

                  return (
                    <div
                      key={chapter.id}
                      onClick={() => !isScheduled && handleChapterClick(chapter)}
                      className={`border-2 rounded-lg p-3 sm:p-4 transition-all group ${
                        isScheduled
                          ? 'border-orange-300 opacity-80 cursor-not-allowed'
                          : isLocked
                          ? 'border-gray-300 opacity-80 cursor-pointer'
                          : 'border-gray-200 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-xl sm:text-2xl flex-shrink-0">
                              {isScheduled ? '⏰' : isLocked ? '🔒' : chapter.chapter_number === 1 ? '💻' : '📚'}
                            </span>
                            <h3 className={`text-base sm:text-lg font-semibold ${
                              isScheduled ? 'text-orange-700' : isLocked ? 'text-gray-700' : 'text-gray-900 group-hover:text-blue-600'
                            } transition-colors`}>
                              Chapter {chapter.chapter_number}: {chapter.title}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{chapter.description}</p>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <span>{chapter.completed_slides}/{chapter.slides_count} slides</span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(chapter.status, isScheduled)}`}>
                              {getStatusLabel(chapter.status, isScheduled)}
                            </span>
                          </div>

                          {/* Scheduled Message */}
                          {isScheduled && chapter.publish_at && (
                            <div className="mb-2 sm:mb-3 bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-xs text-orange-700">
                                Available on {new Date(chapter.publish_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          {/* Locked Message */}
                          {isLocked && !isScheduled && (
                            <div className="mb-2 sm:mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
                              <Lock size={14} className="text-yellow-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                              <p className="text-xs text-yellow-700">
                                Premium content - Upgrade to access
                              </p>
                            </div>
                          )}

                          {/* Chapter Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isScheduled ? 'bg-orange-400' : isLocked ? 'bg-gray-400' : 'bg-blue-600'
                              }`}
                              style={{ width: `${isScheduled ? 0 : chapter.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                       {/* Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isScheduled) handleChapterClick(chapter);
                          }}
                          className={`w-full sm:w-auto sm:ml-4 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                            isScheduled
                              ? 'bg-orange-400 cursor-not-allowed'
                              : isLocked
                              ? 'bg-gray-500 hover:bg-gray-600'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          disabled={isScheduled}
                        >
                          {isScheduled ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="hidden sm:inline">Coming </span>Soon
                            </>
                          ) : isLocked ? (
                            <>
                              <Lock size={16} />
                              Upgrade
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              {chapter.status === 'completed' ? 'Review' : chapter.status === 'in_progress' ? 'Continue' : 'Start'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setSelectedLockedChapter(null);
        }}
        title={selectedLockedChapter?.title || 'Premium Content'}
        description="Upgrade to premium to access this chapter and all exclusive content."
        originalPrice={pricing?.formatted.original_price || 'EGP 500'}
        price={pricing?.formatted.discounted_price || 'EGP 300'}
        discountPercentage={pricing?.discount_percentage || 40}
      />
    </div>
  );
}
