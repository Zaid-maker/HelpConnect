import { HelpRequest } from '@/lib/types/index';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

type RequestStatusProps = {
  request: HelpRequest;
  currentUserId: string;
  onStatusChange?: (updatedRequest: HelpRequest) => void;
};

const statusColors = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export default function RequestStatus({ request, currentUserId, onStatusChange }: RequestStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(request.status);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const isOwner = currentUserId === request.user_id;

  const handleStatusChange = async (newStatus: HelpRequest['status']) => {
    if (!isOwner) return;
    
    setIsLoading(true);
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('help_requests')
        .update({ status: newStatus, updated_at: updatedAt })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state immediately
      setCurrentStatus(newStatus);
      
      // Notify parent component with updated request data
      const updatedRequest = {
        ...request,
        status: newStatus,
        updated_at: updatedAt
      };
      onStatusChange?.(updatedRequest);

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
        {statusLabels[currentStatus]}
      </span>
    );
  }

  return (
    <div className="relative group">
      <button
        disabled={isLoading}
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]} hover:opacity-80 transition-opacity`}
      >
        {statusLabels[currentStatus]}
      </button>
      
      <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-150 z-10">
        <div className="py-1">
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status as HelpRequest['status'])}
              disabled={isLoading || status === currentStatus}
              className={`block w-full text-left px-4 py-2 text-sm ${
                status === currentStatus
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 