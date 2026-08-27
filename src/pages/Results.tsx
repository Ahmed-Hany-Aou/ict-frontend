import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { ResultsListSkeleton } from '../components/Skeleton';
import {
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Loader,
  FileText,
  Trophy
} from 'lucide-react';

interface QuizResult {
  id: number;
  quiz_id: number;
  attempt_number: number;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_taken?: number;
  created_at: string;
  quiz: {
    id: number;
    title: string;
    category: string;
    passing_score: number;
    chapter?: {
      title: string;
      chapter_number: number;
    };
  };
}

export default function Results() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  // Fetch results with React Query
  const { data: results = [], isLoading, error } = useQuery<QuizResult[]>({
    queryKey: ['quiz-results'],
    queryFn: async () => {
      const response = await api.get('/quiz/results');
      return response.data.results || [];
    },
    staleTime: 60 * 1000,
  });

  const filteredResults = results.filter(result => {
    if (filter === 'passed') return result.passed;
    if (filter === 'failed') return !result.passed;
    return true;
  });

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    averageScore: results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <TopBar title="Results" subtitle="View your quiz performance" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <ResultsListSkeleton />
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
              <p className="text-red-600 mb-4">Failed to load results</p>
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
        <TopBar title="Results" subtitle="View your quiz performance" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FileText size={32} />
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Total Attempts</h3>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={32} />
                <span className="text-3xl font-bold">{stats.passed}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Passed</h3>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={32} />
                <span className="text-3xl font-bold">{stats.failed}</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Failed</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={32} />
                <span className="text-3xl font-bold">{stats.averageScore}%</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Average Score</h3>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'passed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Passed ({stats.passed})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Failed ({stats.failed})
            </button>
          </div>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Trophy size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all'
                  ? 'You haven\'t taken any quizzes yet'
                  : filter === 'passed'
                  ? 'No passed quizzes yet'
                  : 'No failed quizzes'}
              </p>
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Take a Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate(`/results/${result.id}`)}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
                    result.passed ? 'border-green-200 hover:border-green-400' : 'border-red-200 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {result.passed ? (
                          <CheckCircle className="text-green-600" size={24} />
                        ) : (
                          <XCircle className="text-red-600" size={24} />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.quiz.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      {result.quiz.chapter && (
                        <p className="text-sm text-gray-600">
                          Chapter {result.quiz.chapter.chapter_number}: {result.quiz.chapter.title}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        result.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.round(result.percentage)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.score}/{result.total_questions} correct
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award size={16} />
                      <span>Attempt #{result.attempt_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>{formatTime(result.time_taken)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Passing score: {result.quiz.passing_score}%
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/results/${result.id}`);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                      >
                        View Details →
                      </button>
                      {!result.passed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quiz/${result.quiz_id}`);
                          }}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
                        >
                          Retry Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
