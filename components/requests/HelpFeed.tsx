'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import RequestCard from './RequestCard';
import { HelpRequest } from '@/lib/types/index';

type HelpFeedProps = {
  initialRequests: HelpRequest[];
  currentUserId?: string;
};

/**
 * Displays and updates a list of community help requests in real time.
 *
 * The HelpFeed component renders an initial set of help requests and listens for live updates via a Supabase channel.
 * It responds to INSERT, UPDATE, and DELETE events on the 'help_requests' table by respectively adding, updating,
 * or removing requests from its state. When there are no available requests, it displays an informative empty state
 * with a prompt to create the first request.
 *
 * @param initialRequests - The initial array of help request objects.
 * @param currentUserId - Optional identifier for the current user.
 *
 * @returns A React element representing the community help request feed.
 */
export default function HelpFeed({ initialRequests, currentUserId }: HelpFeedProps) {
  const [requests, setRequests] = useState<HelpRequest[]>(initialRequests);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('help-requests')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'help_requests'
        }, 
        (payload) => {
          const newRequest = payload.new as HelpRequest;
          setRequests(prev => [newRequest, ...prev]);
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'help_requests'
        }, 
        (payload) => {
          const updatedRequest = payload.new as HelpRequest;
          setRequests(prev => 
            prev.map(request => 
              request.id === updatedRequest.id ? updatedRequest : request
            )
          );
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'help_requests'
        }, 
        (payload) => {
          const deletedId = payload.old.id;
          setRequests(prev => 
            prev.filter(request => request.id !== deletedId)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Community Help Requests</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No help requests at the moment.
          </p>
          <p className="mt-2">
            <button 
              onClick={() => {}} 
              className="text-blue-600 hover:underline"
            >
              Create the first request
            </button>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              currentUserId={currentUserId} 
            />
          ))}
        </div>
      )}
    </div>
  );
} 