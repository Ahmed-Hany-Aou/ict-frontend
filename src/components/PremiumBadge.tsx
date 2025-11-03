// src/components/PremiumBadge.tsx
import React from 'react';
import { Crown, Lock } from 'lucide-react';

interface PremiumBadgeProps {
  variant?: 'crown' | 'lock' | 'tag';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  variant = 'crown',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (variant === 'crown') {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold rounded-full ${sizeClasses[size]} ${className}`}
      >
        <Crown size={iconSizes[size]} fill="currentColor" />
        <span>PREMIUM</span>
      </div>
    );
  }

  if (variant === 'lock') {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-gray-200 text-gray-700 font-semibold rounded-full ${sizeClasses[size]} ${className}`}
      >
        <Lock size={iconSizes[size]} />
        <span>Premium</span>
      </div>
    );
  }

  // tag variant
  return (
    <div
      className={`inline-flex items-center gap-1 bg-purple-100 text-purple-700 font-semibold rounded-md border border-purple-300 ${sizeClasses[size]} ${className}`}
    >
      <Crown size={iconSizes[size]} />
      <span>Premium Content</span>
    </div>
  );
};

export default PremiumBadge;
