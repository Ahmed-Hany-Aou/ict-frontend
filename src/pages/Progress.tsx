import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { ProgressStatsSkeleton } from '../components/Skeleton';
import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  Award,
  Target,
  BarChart3,
  Loader,
  Calendar
} from 'lucide-react';

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

interface ChapterProgress {
  id: number;
  title: string;
  chapter_number: number;
  progress_percentage: number;
  completed_slides: number;
  total_slides: number;
  status: string;
}

export default function ProgressPage() {
  // Fetch progress with React Query
  const { data: progress = null, isLoading: progressLoading } = useQuery<Progress | null>({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const response = await api.get('/user/progress');
      return response.data.statistics || null;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch chapters with React Query (reuse from dashboard)
  const { data: chapters = [], isLoading: chaptersLoading, error } = useQuery<ChapterProgress[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await api.get('/chapters');
      return response.data.chapters || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loading = progressLoading || chaptersLoading;

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Learning Progress</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Track your overall learning journey</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <ProgressStatsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <p className="text-red-600 mb-4">Failed to load progress</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-gray-600 mt-1">Track your learning journey</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={32} />
                <span className="text-4xl font-bold">{progress?.overall_progress}%</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Overall Progress</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <BookOpen size={32} />
                <span className="text-4xl font-bold">{progress?.completed_chapters}/{progress?.total_chapters}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Chapters</h3>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle size={32} />
                <span className="text-4xl font-bold">{progress?.completed_slides}/{progress?.total_slides}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Slides</h3>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Award size={32} />
                <span className="text-4xl font-bold">{progress?.passed_quizzes}/{progress?.total_quizzes}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Quizzes Passed</h3>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={24} />
              Progress Breakdown
            </h2>

            <div className="space-y-6">
              {/* Slides Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-medium text-gray-700">Slides Progress</span>
                    <span className="text-sm text-gray-500">(60% weight)</span>
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

              {/* Quiz Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-orange-600" />
                    <span className="font-medium text-gray-700">Quiz Progress</span>
                    <span className="text-sm text-gray-500">(40% weight)</span>
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

              {/* Overall */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    <span className="font-bold text-gray-900">Overall Progress</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{progress?.overall_progress}%</span>
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

          {/* Chapter Progress */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen size={24} />
              Chapter Progress
            </h2>

            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {chapter.completed_slides}/{chapter.total_slides} slides completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(chapter.progress_percentage)}%
                      </div>
                      <div className={`text-xs font-medium ${
                        chapter.status === 'completed' ? 'text-green-600' :
                        chapter.status === 'in_progress' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {chapter.status === 'completed' ? 'Completed' :
                         chapter.status === 'in_progress' ? 'In Progress' :
                         'Not Started'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${chapter.progress_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
