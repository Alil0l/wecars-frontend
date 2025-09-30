import React from 'react';

const LoadingIndicator = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center">
        {/* Main spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading text with fade animation */}
        <div className="mt-6">
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">
            {message}
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
