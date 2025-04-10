export type RequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';
export type ReportType = 'spam' | 'inappropriate' | 'harassment' | 'other';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  rating: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  urgency_level: UrgencyLevel;
  location: string | null;
  geo_location: object | null;
  location_hidden: boolean;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Offer {
  id: string;
  request_id: string;
  user_id: string;
  message: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
  request?: HelpRequest;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id?: string;
  request_id?: string;
  message_id?: string;
  report_type: ReportType;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  reported_user?: Profile;
  reported_request?: HelpRequest;
  reported_message?: Message;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  request_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  request?: HelpRequest;
  rater?: Profile;
  rated?: Profile;
}

export interface DatabaseError {
  code: string;
  details: string;
  hint: string;
  message: string;
}