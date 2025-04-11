export type RequestStatus = "open" | "in_progress" | "completed" | "cancelled";
export type UrgencyLevel = "low" | "medium" | "high";
export type OfferStatus = "pending" | "accepted" | "rejected";
export type ReportType = "spam" | "inappropriate" | "harassment" | "other";

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
  geo_location: string | null; // PostGIS POINT type stored as text
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
  /** Automatically maintained by database trigger */
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  type: ReportType;
  details: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  reported_user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "message" | "offer" | "status_update" | "system";
  title: string;
  content: string;
  read: boolean;
  related_id: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Feedback {
  id: string;
  request_id: string;
  giver_id: string;
  receiver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  /** Automatically maintained by database trigger */
  updated_at: string;
  giver?: Profile;
  receiver?: Profile;
  request?: HelpRequest;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}
