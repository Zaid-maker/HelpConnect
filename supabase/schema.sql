-- Create PostGIS extension if it doesn't exist (this needs to be done first)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUMs for better data integrity if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
        CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
        CREATE TYPE report_type AS ENUM ('spam', 'inappropriate', 'harassment', 'other');
    END IF;
END $$;

-- Create tables for HelpConnect only if they don't exist

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency_level urgency_level NOT NULL,
    location TEXT,
    status request_status DEFAULT 'open',
    location_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add geo_location column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'help_requests'
        AND column_name = 'geo_location'
    ) THEN
        ALTER TABLE help_requests ADD COLUMN geo_location GEOGRAPHY(POINT);
    END IF;
END $$;

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES help_requests(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    message TEXT NOT NULL,
    status offer_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    receiver_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
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
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES help_requests(id) NOT NULL,
    rater_id UUID REFERENCES profiles(id) NOT NULL,
    rated_id UUID REFERENCES profiles(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, rater_id, rated_id)
);

-- Create indexes only if they don't exist
DO $$ 
BEGIN
    -- Create non-spatial indexes first
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_help_requests_status') THEN
        CREATE INDEX idx_help_requests_status ON help_requests(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_help_requests_category') THEN
        CREATE INDEX idx_help_requests_category ON help_requests(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_help_requests_urgency') THEN
        CREATE INDEX idx_help_requests_urgency ON help_requests(urgency_level);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_help_requests_user') THEN
        CREATE INDEX idx_help_requests_user ON help_requests(user_id);
    END IF;

    -- Create spatial index only if PostGIS is available and column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'help_requests' 
        AND column_name = 'geo_location'
    ) AND EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'postgis'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_help_requests_location') THEN
            CREATE INDEX idx_help_requests_location ON help_requests USING GIST (geo_location);
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_messages_read') THEN
        CREATE INDEX idx_messages_read ON messages(read);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_messages_participants') THEN
        CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_offers_status') THEN
        CREATE INDEX idx_offers_status ON offers(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_offers_request') THEN
        CREATE INDEX idx_offers_request ON offers(request_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_notifications_user_read') THEN
        CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_reports_status') THEN
        CREATE INDEX idx_reports_status ON reports(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relname = 'idx_feedback_rated') THEN
        CREATE INDEX idx_feedback_rated ON feedback(rated_id);
    END IF;
END $$;

-- Enable Row Level Security
DO $$ 
BEGIN
    -- Only enable RLS if it's not already enabled
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop and recreate policies if they exist
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

    -- Help requests policies
    DROP POLICY IF EXISTS "Help requests are viewable by everyone" ON help_requests;
    DROP POLICY IF EXISTS "Users can insert their own help requests" ON help_requests;
    DROP POLICY IF EXISTS "Users can update their own help requests" ON help_requests;
    DROP POLICY IF EXISTS "Users can delete their own help requests" ON help_requests;

    -- Offers policies
    DROP POLICY IF EXISTS "Users can view offers on their requests" ON offers;
    DROP POLICY IF EXISTS "Users can create offers" ON offers;
    DROP POLICY IF EXISTS "Users can update their own offers" ON offers;
    DROP POLICY IF EXISTS "Users can delete their own offers" ON offers;

    -- Messages policies
    DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Users can mark their received messages as read" ON messages;

    -- Reports policies
    DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
    DROP POLICY IF EXISTS "Users can create reports" ON reports;

    -- Notifications policies
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;

    -- Feedback policies
    DROP POLICY IF EXISTS "Feedback is viewable by involved parties" ON feedback;
    DROP POLICY IF EXISTS "Users can create feedback for completed requests" ON feedback;
END $$;

-- Create policies
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
    USING (auth.uid() = receiver_id AND read = FALSE)
    WITH CHECK (auth.uid() = receiver_id AND read = TRUE);

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
    USING (auth.uid() = user_id AND read = FALSE)
    WITH CHECK (auth.uid() = user_id AND read = TRUE);

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

-- Drop existing triggers if they exist and create new ones
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
DROP TRIGGER IF EXISTS update_help_requests_timestamp ON help_requests;
DROP TRIGGER IF EXISTS update_offers_timestamp ON offers;
DROP TRIGGER IF EXISTS update_reports_timestamp ON reports;

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

-- Create or replace location search function
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