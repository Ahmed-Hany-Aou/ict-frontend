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
  X
} from 'lucide-react';

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

  if (loading) {
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex items-start -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <User size={64} className="text-blue-600" />
                </div>
              </div>

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

                {/* Join Date */}
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

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={24} />
              Learning Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="text-purple-600" size={32} />
                  <span className="text-3xl font-bold text-purple-600">
                    {stats?.completed_chapters}/{stats?.total_chapters}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-purple-900">Chapters Completed</h3>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <Award className="text-green-600" size={32} />
                  <span className="text-3xl font-bold text-green-600">
                    {stats?.passed_quizzes}/{stats?.total_quizzes}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-green-900">Quizzes Passed</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="text-blue-600" size={32} />
                  <span className="text-3xl font-bold text-blue-600">
                    {stats?.overall_progress}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-blue-900">Overall Progress</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
