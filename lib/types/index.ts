export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  rating?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  urgency_level: string;
  location: string;
  location_hidden: boolean;
  created_at: string;
  updated_at: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export type Offer = {
  id: string;
  request_id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}; 