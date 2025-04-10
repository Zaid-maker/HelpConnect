import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  Notification, 
  ReportType
} from '../types';

const supabase = createClientComponentClient();

export async function createReport(
  reportType: ReportType,
  description: string,
  reporterId: string,
  reportedId?: string,
  requestId?: string,
  messageId?: string
): Promise<{ data: Report | null; error: DatabaseError | null }> {
  try {
    return await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        request_id: requestId,
        message_id: messageId,
        report_type: reportType,
        description,
        status: 'pending'
      })
      .select()
      .single();
  } catch (e) {
    console.error('Error creating report:', e);
    return { data: null, error: e as DatabaseError };
  }
}

export async function createNotification(
  userId: string,
  title: string,
  content: string,
  type: string,
  actionUrl?: string
) {
  return await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      content,
      type,
      action_url: actionUrl
    })
    .select()
    .single();
}

export async function markNotificationAsRead(notificationId: string) {
  return await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
}

export async function getUnreadNotifications(userId: string) {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });
}

export async function createFeedback(
  requestId: string,
  raterId: string,
  ratedId: string,
  rating: number,
  comment?: string
) {
  const { data: request } = await supabase
    .from('help_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (!request || request.status !== 'completed') {
    throw new Error('Feedback can only be provided for completed requests');
  }

  return await supabase
    .from('feedback')
    .insert({
      request_id: requestId,
      rater_id: raterId,
      rated_id: ratedId,
      rating,
      comment
    })
    .select()
    .single();
}

export async function getUserRating(userId: string) {
  const { data: feedback } = await supabase
    .from('feedback')
    .select('rating')
    .eq('rated_id', userId);

  if (!feedback || feedback.length === 0) {
    return null;
  }

  const averageRating = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
  
  // Update user's profile with new rating
  await supabase
    .from('profiles')
    .update({ rating: averageRating })
    .eq('id', userId);

  return averageRating;
}

export async function searchHelpRequestsByLocation(
  latitude: number,
  longitude: number,
  radiusInMeters: number = 5000, // 5km default radius
  status: string = 'open'
) {
  // Create a point geometry from the provided coordinates
  const point = `POINT(${longitude} ${latitude})`;

  return await supabase
    .rpc('search_help_requests_by_location', {
      user_location: point,
      search_radius: radiusInMeters,
      request_status: status
    });
}

export async function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, payload => {
      onNotification(payload.new as Notification);
    })
    .subscribe();
}