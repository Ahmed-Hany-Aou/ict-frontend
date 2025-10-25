import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  ClipboardList,
  BookOpen,
  Trophy,
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader
} from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  passing_score: number;
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
  const [quizzes, setQuizzes] = useState<GroupedQuizzes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes');
      setQuizzes(response.data.quizzes || {});
      setError(null);
    } catch (err: any) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading quizzes...</p>
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
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchQuizzes}
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
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Quizzes & Exams</h1>
            <p className="text-gray-600 mt-2">Test your knowledge and track your progress</p>
          </div>
        </div>

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
                      {categoryQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => startQuiz(quiz.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {quiz.title}
                            </h3>
                            <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                          </div>

                          {quiz.chapter && (
                            <p className="text-sm text-blue-600 mb-2">
                              Chapter {quiz.chapter.chapter_number}: {quiz.chapter.title}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {quiz.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Target size={16} />
                              <span>Pass: {quiz.passing_score}%</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startQuiz(quiz.id);
                            }}
                            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Start Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
