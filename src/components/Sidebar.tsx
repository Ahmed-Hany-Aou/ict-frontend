import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Award,
  BarChart3,
  ClipboardList,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Zap
} from 'lucide-react';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Chapters', path: '/chapters' },
    { icon: ClipboardList, label: 'Quizzes', path: '/quizzes' },
    { icon: Award, label: 'Results', path: '/results' },
    { icon: BarChart3, label: 'Progress', path: '/progress' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-blue-700 to-blue-900 text-white
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 shadow-2xl
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-700" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">ICT Platform</h2>
              <p className="text-xs text-blue-200">Learning System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Upgrade to Premium Section */}
        <div className="p-4 border-t border-blue-600">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="text-white" size={24} />
              <Zap className="text-white" size={20} />
            </div>
            <h3 className="text-white font-bold text-center text-lg mb-1">
              Upgrade to Premium
            </h3>
            <p className="text-white text-xs text-center mb-3 opacity-90">
              (for short time)
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-white text-sm line-through opacity-75">
                500 EGP
              </span>
              <span className="text-white text-2xl font-extrabold">
                300 EGP
              </span>
            </div>
            <button className="w-full bg-white text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2">
              <Crown size={18} />
              Get Premium
            </button>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 mb-2"
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
