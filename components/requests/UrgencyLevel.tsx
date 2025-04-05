import { HelpRequest } from '@/lib/types/index';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

type UrgencyLevelProps = {
  request: HelpRequest;
  currentUserId: string;
  onUrgencyChange?: (updatedRequest: HelpRequest) => void;
};

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Can wait a few days' },
  { value: 'medium', label: 'Medium - Within 24 hours' },
  { value: 'high', label: 'High - Immediate assistance needed' }
];

const urgencyColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function UrgencyLevel({ request, currentUserId, onUrgencyChange }: UrgencyLevelProps) {
  const [currentUrgency, setCurrentUrgency] = useState(request.urgency_level);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const isOwner = currentUserId === request.user_id;

  const handleUrgencyChange = async (newUrgency: string) => {
    if (!isOwner) return;
    
    setIsLoading(true);
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('help_requests')
        .update({ urgency_level: newUrgency, updated_at: updatedAt })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state immediately
      setCurrentUrgency(newUrgency);
      
      // Notify parent component with updated request data
      const updatedRequest = {
        ...request,
        urgency_level: newUrgency,
        updated_at: updatedAt
      };
      onUrgencyChange?.(updatedRequest);

      toast.success('Urgency level updated successfully');
    } catch (error) {
      console.error('Error updating urgency level:', error);
      toast.error('Failed to update urgency level');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const key = urgency.toLowerCase() as keyof typeof urgencyColors;
    return urgencyColors[key] || 'bg-gray-100 text-gray-800';
  };

  if (!isOwner) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(currentUrgency)}`}>
        {URGENCY_LEVELS.find(level => level.value === currentUrgency)?.label || currentUrgency}
      </span>
    );
  }

  return (
    <div className="relative group">
      <button
        disabled={isLoading}
        className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(currentUrgency)} hover:opacity-80 transition-opacity`}
      >
        {URGENCY_LEVELS.find(level => level.value === currentUrgency)?.label || currentUrgency}
      </button>
      
      <div className="absolute right-0 mt-1 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-150 z-10">
        <div className="py-1">
          {URGENCY_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleUrgencyChange(value)}
              disabled={isLoading || value === currentUrgency}
              className={`block w-full text-left px-4 py-2 text-sm ${
                value === currentUrgency
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