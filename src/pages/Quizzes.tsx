import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import api from '../services/api';
import {
  ClipboardList,
  BookOpen,
  Trophy,
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';
import { usePremium } from '../context/PremiumContext';
import PremiumBadge from '../components/PremiumBadge';
import PremiumModal from '../components/PremiumModal';
import PremiumService, { PricingData } from '../services/premiumService';
import { QuizzesGridSkeleton } from '../components/Skeleton';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  passing_score: number;
  is_premium?: boolean;
  is_locked?: boolean;
  publish_at?: string | null;
  is_scheduled?: boolean;
  chapter?: {
    title: string;
    chapter_number: number;
  };
}

interface GroupedQuizzes {
  [key: string]: Quiz[];
}

const categoryIcons = {
  chapter: BookOpen,
  midterm: Target,
  final: Trophy,
  practice: ClipboardList
};

const categoryColors = {
  chapter: 'from-blue-500 to-blue-600',
  midterm: 'from-purple-500 to-purple-600',
  final: 'from-red-500 to-red-600',
  practice: 'from-green-500 to-green-600'
};

const categoryLabels = {
  chapter: 'Chapter Quizzes',
  midterm: 'Midterm Exams',
  final: 'Final Exams',
  practice: 'Practice Tests'
};

export default function Quizzes() {
  const navigate = useNavigate();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLockedQuiz, setSelectedLockedQuiz] = useState<Quiz | null>(null);

  // Fetch quizzes with React Query
  const { data: quizzes = {}, isLoading, error } = useQuery<GroupedQuizzes>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await api.get('/quizzes');
      return response.data.quizzes || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch pricing with React Query
  const { data: pricing } = useQuery<PricingData>({
    queryKey: ['pricing'],
    queryFn: async () => {
      const response = await PremiumService.getPricing();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
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

  const startQuiz = (quiz: Quiz) => {
    const isLocked = quiz.is_locked || (quiz.is_premium && !isPremium);

    if (isLocked) {
      setSelectedLockedQuiz(quiz);
      setShowPremiumModal(true);
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  // Show skeleton while loading
  if (isLoading || premiumLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <TopBar title="Quizzes" subtitle="Test your knowledge" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <QuizzesGridSkeleton />
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
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load quizzes</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
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
        <TopBar title="Quizzes" subtitle="Test your knowledge" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {Object.keys(quizzes).length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Available</h3>
              <p className="text-gray-500">Check back later for new quizzes</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(quizzes).map(([category, categoryQuizzes]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || ClipboardList;
                const gradientColor = categoryColors[category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';
                const label = categoryLabels[category as keyof typeof categoryLabels] || category;

                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className={`bg-gradient-to-r ${gradientColor} text-white p-4 rounded-t-xl flex items-center gap-3`}>
                      <Icon size={24} />
                      <h2 className="text-xl font-bold">{label}</h2>
                      <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                        {categoryQuizzes.length} {categoryQuizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                      </span>
                    </div>

                    {/* Quizzes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded-b-xl shadow">
                      {categoryQuizzes.map((quiz) => {
                        const isLocked = quiz.is_locked || (quiz.is_premium && !isPremium);
                        const isScheduled = quiz.is_scheduled || false;

                        return (
                          <div
                            key={quiz.id}
                            className={`border-2 rounded-lg p-4 transition-all group ${
                              isScheduled
                                ? 'border-orange-300 opacity-75 cursor-not-allowed'
                                : isLocked
                                ? 'border-gray-300 opacity-75 hover:border-gray-400 cursor-pointer'
                                : 'border-gray-200 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                            }`}
                            onClick={() => !isScheduled && startQuiz(quiz)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className={`text-lg font-semibold transition-colors ${
                                  isScheduled ? 'text-orange-600' : isLocked ? 'text-gray-600' : 'text-gray-800 group-hover:text-blue-600'
                                }`}>
                                  {quiz.title}
                                </h3>
                                <div className="mt-1 flex gap-2">
                                  {quiz.is_premium && (
                                    <PremiumBadge variant={isLocked ? "lock" : "crown"} size="sm" />
                                  )}
                                  {isScheduled && (
                                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Coming Soon
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isScheduled ? (
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : isLocked ? (
                                <Lock className="text-gray-400" size={20} />
                              ) : (
                                <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                              )}
                            </div>

                            {quiz.chapter && (
                              <p className="text-sm text-blue-600 mb-2">
                                Chapter {quiz.chapter.chapter_number}: {quiz.chapter.title}
                              </p>
                            )}

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {quiz.description}
                            </p>

                            {isScheduled && (
                              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-start gap-2">
                                <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-orange-700">
                                  This quiz will be available on {new Date(quiz.publish_at || '').toLocaleDateString()}
                                </p>
                              </div>
                            )}

                            {isLocked && !isScheduled && (
                              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-start gap-2">
                                <Lock size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700">
                                  Premium quiz - Upgrade to access
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <div className="flex items-center gap-1">
                                <Target size={16} />
                                <span>Pass: {quiz.passing_score}%</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isScheduled) startQuiz(quiz);
                              }}
                              className={`w-full py-2 rounded-lg transition-colors font-medium ${
                                isScheduled
                                  ? 'bg-orange-400 text-white cursor-not-allowed'
                                  : isLocked
                                  ? 'bg-gray-400 text-white hover:bg-gray-500'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              disabled={isScheduled}
                            >
                              {isScheduled ? (
                                <span className="flex items-center justify-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Coming Soon
                                </span>
                              ) : isLocked ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Lock size={16} />
                                  Upgrade to Access
                                </span>
                              ) : (
                                'Start Quiz'
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setSelectedLockedQuiz(null);
        }}
        title={selectedLockedQuiz?.title || 'Premium Quiz'}
        description="Upgrade to premium to access this quiz and all exclusive content."
        originalPrice={pricing?.formatted.original_price || 'EGP 500'}
        price={pricing?.formatted.discounted_price || 'EGP 300'}
        discountPercentage={pricing?.discount_percentage || 40}
      />
    </div>
  );
}
