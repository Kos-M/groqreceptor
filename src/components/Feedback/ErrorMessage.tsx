import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss,
  className = ''
}) => {
  if (!message) return null;
  
  return (
    <div className={`bg-red-500/90 text-white p-3 rounded-md my-3 shadow-md ${className}`}>
      <div className="flex items-start">
        <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
        <div className="flex-grow overflow-hidden break-words">{message}</div>
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="ml-2 hover:text-gray-200 p-1 -mt-1 -mr-1 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 