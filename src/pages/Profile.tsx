import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  Loader,
  Edit,
  Save,
  X,
  Crown
} from 'lucide-react';
import { usePremium } from '../context/PremiumContext';
import PremiumBadge from '../components/PremiumBadge';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface UserStats {
  total_chapters: number;
  completed_chapters: number;
  total_slides: number;
  completed_slides: number;
  total_quizzes: number;
  passed_quizzes: number;
  overall_progress: number;
}

export default function Profile() {
  const { isPremium, premiumExpiresAt, daysRemaining, loading: premiumLoading } = usePremium();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [userResponse, progressResponse] = await Promise.all([
        api.get('/user'),
        api.get('/user/progress')
      ]);

      setUser(userResponse.data);
      setStats(progressResponse.data.statistics || null);
      setEditName(userResponse.data.name);
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // This would need a backend endpoint to update the profile
      // For now, we'll just close the edit mode
      setEditing(false);
      // await api.put('/profile', { name: editName });
      // loadProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || premiumLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
              <p className="text-red-600 mb-4">{error || 'User not found'}</p>
              <button
                onClick={loadProfile}
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
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Header with gradient */}
            <div className={`h-32 ${isPremium ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}></div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex items-start -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <User size={64} className={isPremium ? 'text-yellow-500' : 'text-blue-600'} />
                  </div>
                  {isPremium && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <PremiumBadge variant="crown" size="md" />
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Status Banner */}
              {isPremium && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <Crown size={24} className="text-yellow-600" fill="currentColor" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900">Premium Member</h3>
                    <p className="text-sm text-yellow-700">
                      {premiumExpiresAt
                        ? `Expires on ${formatDate(premiumExpiresAt)} (${daysRemaining} days remaining)`
                        : 'Lifetime access'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Save size={18} />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditName(user.name);
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 flex items-center gap-2"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-gray-900">{user.name}</span>
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Mail size={20} className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 text-gray-900">
                    <Calendar size={20} className="text-gray-400" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Learning Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Progress */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Overall Progress</span>
                    <Award className="text-blue-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{stats.overall_progress}%</p>
                </div>

                {/* Chapters */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Chapters</span>
                    <BookOpen className="text-green-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.completed_chapters}/{stats.total_chapters}
                  </p>
                </div>

                {/* Slides */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">Slides Completed</span>
                    <BookOpen className="text-purple-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.completed_slides}/{stats.total_slides}
                  </p>
                </div>

                {/* Quizzes */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">Quizzes Passed</span>
                    <Award className="text-orange-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.passed_quizzes}/{stats.total_quizzes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
