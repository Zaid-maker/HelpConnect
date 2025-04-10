-- Create ENUMs for better data integrity
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_type AS ENUM ('spam', 'inappropriate', 'harassment', 'other');

-- Create tables for HelpConnect

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT[],
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT
);

-- Help requests table
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency_level urgency_level NOT NULL,
  location TEXT,
  geo_location GEOGRAPHY(POINT),
  location_hidden BOOLEAN DEFAULT FALSE,
  status request_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table (responses to help requests)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES help_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  status offer_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for direct communication
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table for content moderation
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  reported_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES help_requests(id),
  message_id UUID REFERENCES messages(id),
  report_type report_type NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_reportable_item CHECK (
    (reported_id IS NOT NULL)::integer +
    (request_id IS NOT NULL)::integer +
    (message_id IS NOT NULL)::integer = 1
  )
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table for user ratings
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES help_requests(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, rater_id, rated_id)
);

-- Create PostGIS extension for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create indexes for better query performance
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_category ON help_requests(category);
CREATE INDEX idx_help_requests_urgency ON help_requests(urgency_level);
CREATE INDEX idx_help_requests_location ON help_requests USING GIST (geo_location);
CREATE INDEX idx_help_requests_user ON help_requests(user_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_request ON offers(request_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_feedback_rated ON feedback(rated_id);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Help requests policies
CREATE POLICY "Help requests are viewable by everyone"
  ON help_requests FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own help requests"
  ON help_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help requests"
  ON help_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help requests"
  ON help_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Offers policies
CREATE POLICY "Users can view offers on their requests"
  ON offers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM help_requests WHERE id = request_id
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can create offers"
  ON offers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers"
  ON offers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offers"
  ON offers FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can read their own messages"
  ON messages FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their received messages as read"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id AND OLD.read = FALSE AND NEW.read = TRUE);

-- Reports policies
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND OLD.read = FALSE AND NEW.read = TRUE);

-- Feedback policies
CREATE POLICY "Feedback is viewable by involved parties"
  ON feedback FOR SELECT
  USING (auth.uid() IN (rater_id, rated_id));

CREATE POLICY "Users can create feedback for completed requests"
  ON feedback FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
      SELECT 1 FROM help_requests
      WHERE id = request_id
      AND status = 'completed'
    )
  );

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_help_requests_timestamp
    BEFORE UPDATE ON help_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_offers_timestamp
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reports_timestamp
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create location search function
CREATE OR REPLACE FUNCTION search_help_requests_by_location(
  user_location GEOGRAPHY,
  search_radius FLOAT,
  request_status TEXT DEFAULT 'open'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  urgency_level urgency_level,
  location TEXT,
  geo_location GEOGRAPHY,
  location_hidden BOOLEAN,
  status request_status,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hr.*,
    ST_Distance(hr.geo_location, user_location) as distance
  FROM help_requests hr
  WHERE 
    hr.status::TEXT = request_status
    AND hr.location_hidden = FALSE
    AND hr.geo_location IS NOT NULL
    AND ST_DWithin(hr.geo_location, user_location, search_radius)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;