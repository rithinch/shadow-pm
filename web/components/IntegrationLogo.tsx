
import React from 'react';

type IntegrationType = 'github' | 'jira' | 'slack' | 'linear' | 'shortcut' | 'teams';

export const IntegrationLogo: React.FC<{ type: IntegrationType, size?: number }> = ({ type, size = 24 }) => {
  const getLogo = () => {
    switch (type) {
      case 'github':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'jira':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="#0052CC">
            <path d="M11.525 2.115l-8.08 8.08a1.056 1.056 0 0 0 0 1.49l8.08 8.08a1.056 1.056 0 0 0 1.49 0l8.08-8.08a1.056 1.056 0 0 0 0-1.49l-8.08-8.08a1.056 1.056 0 0 0-1.49 0z"/>
          </svg>
        );
      case 'linear':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        );
      case 'slack':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 1h1v1H6v-1zm10 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-1 0v-1h1v1h-1zM9 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 1h1v1H9v-1z"/>
          </svg>
        );
      default:
        return (
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">
            {type.substring(0, 1).toUpperCase()}
          </div>
        );
    }
  };

  return <div className="inline-block">{getLogo()}</div>;
};
