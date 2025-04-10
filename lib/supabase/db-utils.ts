import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  Notification, 
  ReportType
} from '../types';

const supabase = createClientComponentClient();

/**
 * Creates a new report entry with the specified details in the "reports" table.
 *
 * Inserts a report record with a default status of "pending". Returns the inserted report data if successful;
 * otherwise, returns an error detailing the failure.
 *
 * @param reportType - The type of the report.
 * @param description - A detailed explanation of the report.
 * @param reporterId - The ID of the user submitting the report.
 * @param reportedId - (Optional) The ID of the user or entity being reported.
 * @param requestId - (Optional) The identifier of the related help request.
 * @param messageId - (Optional) The identifier of the related message.
 *
 * @returns An object containing the newly created report data or a database error.
 */
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

/**
 * Creates a new notification for a user.
 *
 * Inserts a notification record into the 'notifications' table using the provided title, content, type, and an optional action URL, then returns the created record.
 *
 * @param userId - Identifier of the user receiving the notification.
 * @param title - Title of the notification.
 * @param content - Message content of the notification.
 * @param type - Category or type of the notification.
 * @param actionUrl - Optional URL for an action related to the notification.
 * @returns The inserted notification record.
 */
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

/**
 * Marks a notification as read by updating its "read" status in the database.
 *
 * This asynchronous function updates the notification with the provided ID in the
 * "notifications" table, setting its "read" status to true, and returns the updated record.
 *
 * @param notificationId - The ID of the notification to mark as read.
 * @returns A promise that resolves with the updated notification data.
 */
export async function markNotificationAsRead(notificationId: string) {
  return await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
}

/**
 * Retrieves unread notifications for a specified user.
 *
 * This function queries the 'notifications' table for entries where the user ID matches the provided identifier and the notification has not been read, returning them in descending order by creation date.
 *
 * @param userId - The identifier of the user whose unread notifications are being fetched.
 * @returns A promise that resolves to the query result containing the unread notifications.
 */
export async function getUnreadNotifications(userId: string) {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });
}

/**
 * Creates feedback for a completed help request.
 *
 * This asynchronous function verifies that the help request identified by `requestId` is completed.
 * If the request is not completed or does not exist, it throws an error. Otherwise, it inserts the feedback,
 * including the `rating` and optional `comment`, into the "feedback" table and returns the inserted record.
 *
 * @param requestId - The unique identifier of the help request.
 * @param raterId - The unique identifier of the user providing the feedback.
 * @param ratedId - The unique identifier of the user receiving the feedback.
 * @param rating - The numerical rating assigned.
 * @param comment - An optional comment accompanying the feedback.
 *
 * @throws {Error} Feedback can only be provided for completed requests.
 *
 * @returns The inserted feedback record.
 */
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

/**
 * Calculates the average feedback rating for a user and updates their profile.
 *
 * This function retrieves all feedback ratings associated with the specified user from the 'feedback' table,
 * calculates the average rating, updates the corresponding user's profile in the 'profiles' table with the new 
 * average rating, and returns the computed value. If no feedback entries are found, it returns null.
 *
 * @param userId - The identifier of the user whose rating is computed.
 * @returns The computed average rating or null if no feedback exists.
 */
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

/**
 * Searches for help requests within a specified radius from a given geographical location.
 *
 * This asynchronous function creates a point geometry using the provided latitude and longitude,
 * then calls the PostgreSQL RPC function `search_help_requests_by_location` to retrieve help requests
 * that match the given status. The search radius, specified in meters, defaults to 5000 (5 km).
 *
 * @param latitude - The latitude of the location to search from.
 * @param longitude - The longitude of the location to search from.
 * @param radiusInMeters - The search radius in meters. Defaults to 5000.
 * @param status - The status filter to apply on help requests. Defaults to 'open'.
 * @returns A Promise that resolves with the result of the help requests search.
 */
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

/**
 * Subscribes to real-time notifications for a specific user.
 *
 * Listens for new notifications inserted into the 'notifications' table where the user ID matches the provided userId.
 * When an insertion occurs, the callback is invoked with the new notification data.
 *
 * @param userId - The unique identifier of the user to receive notifications.
 * @param onNotification - Function to be called with the notification object when a new notification is received.
 * @returns A promise that resolves to the subscription object for the notifications channel.
 */
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