import React from 'react';
import Sidebar from '../components/Sidebar';
import {
  BookOpen,
  Target,
  Zap,
  Users,
  Award,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Shield,
  Smartphone,
  BarChart3,
  Heart,
  Star,
  Code,
  Rocket
} from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Chapters',
      description: 'Comprehensive learning materials organized into structured chapters with slides and multimedia content.',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed progress statistics and completion tracking.',
      color: 'green'
    },
    {
      icon: Award,
      title: 'Quiz System',
      description: 'Test your knowledge with interactive quizzes and receive instant feedback on your performance.',
      color: 'purple'
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Install as a Progressive Web App (PWA) for offline access and native app experience.',
      color: 'orange'
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Your progress syncs seamlessly across all your devices in real-time.',
      color: 'yellow'
    },
    {
      icon: Shield,
      title: 'Secure Learning',
      description: 'Your data is protected with enterprise-grade security and authentication.',
      color: 'red'
    }
  ];

  const stats = [
    {
      icon: Users,
      value: '1000+',
      label: 'Active Learners',
      color: 'blue'
    },
    {
      icon: BookOpen,
      value: '50+',
      label: 'Learning Chapters',
      color: 'green'
    },
    {
      icon: Award,
      value: '100+',
      label: 'Quizzes Available',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Success Rate',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string; gradient: string } } = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-500',
        gradient: 'from-blue-500 to-blue-600'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-500',
        gradient: 'from-green-500 to-green-600'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-500',
        gradient: 'from-purple-500 to-purple-600'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-500',
        gradient: 'from-orange-500 to-orange-600'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-500',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-500',
        gradient: 'from-red-500 to-red-600'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                <BookOpen className="text-blue-600" size={40} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to ICT Learning Platform
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                A modern, interactive learning platform designed to help students master Information and Communication Technology concepts through engaging content and hands-on practice.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Self-Paced Learning</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Interactive Content</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mission Section */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
                    <Target size={20} />
                    <span className="font-semibold">Our Mission</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Empowering Students Through Technology
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Our platform is dedicated to providing high-quality, accessible ICT education to students at all levels. We believe that technology education should be engaging, practical, and tailored to modern learning needs.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By combining interactive content, real-time progress tracking, and comprehensive assessments, we create an environment where students can learn at their own pace and achieve their full potential.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Innovative Learning</h3>
                      <p className="text-sm text-gray-600">Modern teaching methods combined with traditional academic rigor.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Student-Centered</h3>
                      <p className="text-sm text-gray-600">Designed with student needs and success as our top priority.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Rocket className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Continuous Improvement</h3>
                      <p className="text-sm text-gray-600">Constantly updating content and features based on feedback.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full mb-4">
                <Star size={20} />
                <span className="font-semibold">Platform Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform offers a comprehensive suite of features designed to enhance your learning experience and help you achieve your academic goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colors = getColorClasses(feature.color);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-2 border-gray-100 hover:border-blue-200"
                  >
                    <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={colors.text} size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Our Impact in Numbers
                </h2>
                <p className="text-blue-100 max-w-2xl mx-auto">
                  Join thousands of students who are already learning and growing with our platform.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
                    >
                      <Icon className="text-white mx-auto mb-3" size={32} />
                      <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-blue-100 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full mb-4">
                <Rocket size={20} />
                <span className="font-semibold">How It Works</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Getting started is easy. Follow these simple steps to begin mastering ICT concepts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Create Account</h3>
                  <p className="text-sm text-gray-600">Sign up for free and set up your profile</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-300 transform -translate-y-1/2"></div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Choose Chapter</h3>
                  <p className="text-sm text-gray-600">Browse chapters and start with any topic</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Learn & Practice</h3>
                  <p className="text-sm text-gray-600">Study slides and complete interactive quizzes</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-purple-300 transform -translate-y-1/2"></div>
              </div>

              <div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-sm text-gray-600">Monitor your achievements and growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack Section */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full mb-4">
                  <Code size={20} />
                  <span className="font-semibold">Built With Modern Technology</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Powered by Cutting-Edge Tech
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our platform is built using the latest web technologies to ensure fast, reliable, and secure learning experience.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">⚛️</div>
                  <h4 className="font-bold text-gray-900">React</h4>
                  <p className="text-xs text-gray-600 mt-1">Frontend Framework</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-bold text-gray-900">Tailwind CSS</h4>
                  <p className="text-xs text-gray-600 mt-1">UI Styling</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">🐘</div>
                  <h4 className="font-bold text-gray-900">Laravel</h4>
                  <p className="text-xs text-gray-600 mt-1">Backend API</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="font-bold text-gray-900">PWA</h4>
                  <p className="text-xs text-gray-600 mt-1">Mobile App</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
                Join our community of learners today and take the first step towards mastering Information and Communication Technology.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-white text-green-600 font-bold py-4 px-8 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center gap-2 shadow-lg"
                >
                  <Rocket size={20} />
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/chapters'}
                  className="bg-green-700 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-800 transition-colors duration-200 flex items-center gap-2"
                >
                  <BookOpen size={20} />
                  Browse Chapters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
