'use client';

import { HelpRequest } from '@/lib/types/index';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RequestCardProps = {
  request: HelpRequest;
  currentUserId?: string;
};

export default function RequestCard({ request, currentUserId }: RequestCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const isOwner = currentUserId === request.user_id;
  
  const urgencyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    emergency: 'bg-red-600 text-white'
  };
  
  // Get urgency color class
  const getUrgencyClass = () => {
    const key = request.urgency_level.toLowerCase() as keyof typeof urgencyColors;
    return urgencyColors[key] || 'bg-gray-100 text-gray-800';
  };
  
  const handleOfferHelp = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    try {
      router.push(`/requests/${request.id}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{request.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyClass()}`}>
            {request.urgency_level}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {request.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="mr-3">{request.category}</span>
          {request.location && !request.location_hidden && (
            <span>{request.location}</span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Status: <span className="capitalize">{request.status}</span>
          </span>
          
          {!isOwner && request.status === 'open' && (
            <button
              onClick={handleOfferHelp}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'I Can Help'}
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={() => router.push(`/requests/edit/${request.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 