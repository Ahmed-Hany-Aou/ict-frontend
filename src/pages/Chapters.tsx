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
  Award
} from 'lucide-react';

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
}

export default function Chapters() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChapters();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  if (loading) {
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
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-400 overflow-hidden"
                >
                  {/* Header with status badge */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
                    <div className="absolute top-4 right-4">
                      {chapter.status === 'completed' && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={14} />
                          DONE
                        </div>
                      )}
                    </div>
                    <div className="text-5xl mb-3">
                      {chapter.chapter_number === 1 ? '💻' : '📚'}
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      Chapter {chapter.chapter_number}
                    </h3>
                    <p className="text-blue-100 text-sm">
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
                        <span className="text-xs font-bold text-blue-600">{chapter.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${chapter.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-600" />
                        {chapter.completed_slides} done
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(chapter.status)}`}>
                        {getStatusLabel(chapter.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/chapter/${chapter.id}/slides`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        {chapter.status === 'completed' ? 'Review' : chapter.status === 'in_progress' ? 'Continue' : 'Start'}
                      </button>
                      <button
                       // onClick={() => navigate(`/chapter/${chapter.id}/quiz`)}
                       onClick={() => navigate(`/quizzes?chapterId=${chapter.id}`)}
                        className="bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                        title="Take Quiz"
                      >
                        <FileQuestion size={18} />
                      </button>
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
