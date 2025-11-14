import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {title && (
              <>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Right Section - User & Notifications */}
          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.email || ''}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
              </div>
            </div>

            {/* Mobile User Avatar Only */}
            <div className="sm:hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
