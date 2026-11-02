import React from 'react';
import { AchievementRankId } from '../utils/storage';

interface RankEmblemProps {
  rankId: AchievementRankId;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const RankEmblem: React.FC<RankEmblemProps> = ({ rankId, size = 'md' }) => {
  const sizeClass =
    size === 'xs'
      ? 'w-3.5 h-3.5'
      : size === 'sm'
      ? 'w-4 h-4'
      : size === 'lg'
      ? 'w-8 h-8'
      : 'w-6 h-6';

  switch (rankId) {
    case 'warrior':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <path
            d="M12 2.5L4.5 6V11.5C4.5 16.5 7.7 20.8 12 22C16.3 20.8 19.5 16.5 19.5 11.5V6L12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path d="M12 7V16M9 10L12 7L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'elite':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <path
            d="M12 2L4 5.8V11.8C4 16.8 7.4 21 12 22.2C16.6 21 20 16.8 20 11.8V5.8L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path
            d="M8.5 11.5L12 8L15.5 11.5M8.5 15L12 11.5L15.5 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'master':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <polygon
            points="12,2 20,7 20,17 12,22 4,17 4,7"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <polygon
            points="12,6.5 16.5,12 12,17.5 7.5,12"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </svg>
      );
    case 'grandmaster':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <polygon
            points="12,2 20.5,6.8 20.5,17.2 12,22 3.5,17.2 3.5,6.8"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <path
            d="M12 6L14 10.2L18.5 10.8L15.2 13.8L16 18.2L12 16L8 18.2L8.8 13.8L5.5 10.8L10 10.2L12 6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.28"
          />
        </svg>
      );
    case 'epic':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <path
            d="M12 2L19.5 6.5L21 14.5L12 22L3 14.5L4.5 6.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path
            d="M12 6L16.5 12L12 18L7.5 12L12 6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.35"
          />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      );
    case 'legend':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <path
            d="M3 8.5L7.5 11.5L12 4.5L16.5 11.5L21 8.5L19 18.5H5L3 8.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.22"
          />
          <path d="M6 21H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="13.5" r="1.8" fill="currentColor" />
        </svg>
      );
    case 'mythic':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={sizeClass} aria-hidden="true">
          <path
            d="M12 2L15.2 6.8L21.5 5.5L19.2 12L21.5 17.5L15.5 18.2L12 22.5L8.5 18.2L2.5 17.5L4.8 12L2.5 5.5L8.8 6.8L12 2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <polygon
            points="12,7 15.5,12 12,17 8.5,12"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="currentColor"
          />
        </svg>
      );
  }
};
