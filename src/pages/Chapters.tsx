import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  BookOpen,
  Play,
  CheckCircle,
  Loader,
  FileQuestion,
  Award,
  Lock
} from 'lucide-react';
import { usePremium } from '../context/PremiumContext';
import PremiumBadge from '../components/PremiumBadge';
import PremiumModal from '../components/PremiumModal';
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
  is_locked?: boolean;
  publish_at?: string | null;
  is_scheduled?: boolean;
}

export default function Chapters() {
  const navigate = useNavigate();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLockedChapter, setSelectedLockedChapter] = useState<Chapter | null>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);

  useEffect(() => {
    loadChapters();
    loadPricing();
  }, []);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chapters');
      setChapters(response.data.chapters || []);
      setError(null);
    } catch (err) {
      console.error('Error loading chapters:', err);
      setError('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const loadPricing = async () => {
    try {
      const response = await PremiumService.getPricing();
      setPricing(response.data);
    } catch (err) {
      console.error('Error loading pricing:', err);
      // Use fallback pricing if API fails
      setPricing({
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
      });
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    const isLocked = chapter.is_locked || (chapter.is_premium && !isPremium);

    if (isLocked) {
      setSelectedLockedChapter(chapter);
      setShowPremiumModal(true);
    } else {
      navigate(`/chapter/${chapter.id}/slides`);
    }
  };

  const handleQuizClick = (chapter: Chapter) => {
    const isLocked = chapter.is_locked || (chapter.is_premium && !isPremium);

    if (isLocked) {
      setSelectedLockedChapter(chapter);
      setShowPremiumModal(true);
    } else {
      navigate(`/quizzes?chapterId=${chapter.id}`);
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

  if (loading || premiumLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading chapters...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadChapters}
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
            <h1 className="text-3xl font-bold text-gray-900">All Chapters</h1>
            <p className="text-gray-600 mt-1">Browse and access your learning materials</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {chapters.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Chapters Available</h3>
              <p className="text-gray-500">Check back later for new learning content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => {
                const isLocked = chapter.is_locked || (chapter.is_premium && !isPremium);
                const isScheduled = chapter.is_scheduled || false;

                return (
                  <div
                    key={chapter.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 overflow-hidden ${
                      isScheduled
                        ? 'border-orange-300 opacity-90'
                        : isLocked
                        ? 'border-gray-300 opacity-90'
                        : 'border-gray-100 hover:border-blue-400'
                    }`}
                  >
                    {/* Header with status badge */}
                    <div
                      className={`p-6 text-white relative ${
                        isScheduled
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : isLocked
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                    >
                      <div className="absolute top-4 right-4 flex gap-2">
                        {chapter.is_premium && <PremiumBadge variant="crown" size="sm" />}
                        {chapter.status === 'completed' && !isLocked && !isScheduled && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={14} />
                            DONE
                          </div>
                        )}
                      </div>
                      <div className="text-5xl mb-3">
                        {isScheduled ? '⏰' : isLocked ? '🔒' : chapter.chapter_number === 1 ? '💻' : '📚'}
                      </div>
                      <h3 className="text-xl font-bold mb-1">
                        Chapter {chapter.chapter_number}
                      </h3>
                      <p className={`text-sm ${isScheduled ? 'text-orange-100' : isLocked ? 'text-gray-200' : 'text-blue-100'}`}>
                        {chapter.slides_count} slides
                      </p>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {chapter.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {chapter.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-blue-600">
                            {chapter.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isScheduled ? 'bg-orange-400' : isLocked ? 'bg-gray-400' : 'bg-blue-600'
                            }`}
                            style={{ width: `${isScheduled ? 0 : chapter.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={16} className="text-green-600" />
                          {chapter.completed_slides} done
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            chapter.status, isScheduled
                          )}`}
                        >
                          {getStatusLabel(chapter.status, isScheduled)}
                        </span>
                      </div>

                      {/* Scheduled Message */}
                      {isScheduled && (
                        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                          <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-orange-700">
                            This chapter will be available on {new Date(chapter.publish_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Locked Message */}
                      {isLocked && !isScheduled && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                          <Lock size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-700">
                            Premium content - Upgrade to access
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChapterClick(chapter)}
                          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                            isScheduled
                              ? 'bg-orange-400 text-white cursor-not-allowed'
                              : isLocked
                              ? 'bg-gray-400 text-white cursor-pointer hover:bg-gray-500'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          disabled={isScheduled}
                        >
                          {isScheduled ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Coming Soon
                            </>
                          ) : isLocked ? (
                            <>
                              <Lock size={16} />
                              Upgrade
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              {chapter.status === 'completed'
                                ? 'Review'
                                : chapter.status === 'in_progress'
                                ? 'Continue'
                                : 'Start'}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleQuizClick(chapter)}
                          className={`px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center ${
                            isScheduled || isLocked
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                          title={isScheduled ? 'Coming soon' : isLocked ? 'Premium content' : 'Take Quiz'}
                          disabled={isScheduled || isLocked}
                        >
                          <FileQuestion size={18} />
                        </button>
                      </div>
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
