
/* 
  Supabase Schema for Dramarr
  ------------------------------------------------------------------
  INSTRUCTIONS:
  1. Go to your Supabase Dashboard -> SQL Editor.
  2. Paste this entire script.
  3. Click "Run".
  
  FEATURES:
  - Idempotent: Can be run multiple times without "already exists" errors.
  - Smart View Counting: Backend logic prevents creators from boosting their own views.
  - Security: Row Level Security (RLS) policies included.
*/

-- 1. Create Tables (IF NOT EXISTS)
-- Ensure profiles table has necessary columns (migrating if exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  public_key text, -- ADDED: For End-to-End Encryption
  is_verified boolean DEFAULT false,
  is_creator boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  coins integer DEFAULT 100,
  credits integer DEFAULT 5,
  following text[] DEFAULT '{}',
  followers integer DEFAULT 0,
  unlocked_video_ids text[] DEFAULT '{}',
  bio text,
  first_name text,
  last_name text,
  dob text,
  gender text,
  country text,
  state text,
  city text,
  address text,
  paypal_email text,
  subscription_status text DEFAULT 'free',
  daily_premium_unlock_count integer DEFAULT 0,
  last_premium_unlock_date text,
  is_driver boolean DEFAULT false,
  driver_status text DEFAULT 'none',
  online_status text DEFAULT 'offline',
  driver_rating float DEFAULT 5.0,
  wallet_balance float DEFAULT 0.0,
  auto_clear_cache boolean DEFAULT false,
  accessibility_captions boolean DEFAULT false,
  high_contrast_mode boolean DEFAULT false,
  haptic_feedback_strength text DEFAULT 'low',
  high_definition_playback boolean DEFAULT true,
  data_saver_mode boolean DEFAULT false,
  ai_memory_enabled boolean DEFAULT true,
  screen_time_limit integer DEFAULT 60,
  monetization_enabled boolean DEFAULT false,
  creator_tier text DEFAULT 'Starter',
  monthly_watch_time integer DEFAULT 0,
  pending_payout_balance float DEFAULT 0.0,
  lifetime_earnings float DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now()
);

-- Add columns if they don't exist (migrations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
        ALTER TABLE public.profiles ADD COLUMN state text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE public.profiles ADD COLUMN city text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'public_key') THEN
        ALTER TABLE public.profiles ADD COLUMN public_key text;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  url text NOT NULL,
  thumbnail_url text,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  description text,
  tags text[],
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  unlock_cost integer DEFAULT 0,
  series_title text,
  episode_number integer DEFAULT 1,
  is_ad boolean DEFAULT false,
  ad_action_label text,
  ad_destination_url text,
  created_at timestamp with time zone DEFAULT now(),
  series_id uuid REFERENCES public.series(id) ON DELETE SET NULL,
  CONSTRAINT videos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text,
  year integer,
  total_episodes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT series_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  segments_json text,
  views integer DEFAULT 0,
  privacy text DEFAULT 'public',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stories_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  media_url text,
  media_type text,
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  text text NOT NULL,
  parent_id uuid REFERENCES public.comments(id),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.view_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT view_logs_pkey PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Wrapped in DO block to emulate IF NOT EXISTS)
DO $$
BEGIN
    -- Profiles Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Videos Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Public videos are viewable by everyone') THEN
        CREATE POLICY "Public videos are viewable by everyone" ON public.videos FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Users can insert their own videos') THEN
        CREATE POLICY "Users can insert their own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Users can delete their own videos') THEN
        CREATE POLICY "Users can delete their own videos" ON public.videos FOR DELETE USING (auth.uid() = creator_id);
    END IF;

    -- Series Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Public series are viewable by everyone') THEN
        CREATE POLICY "Public series are viewable by everyone" ON public.series FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Users can insert their own series') THEN
        CREATE POLICY "Users can insert their own series" ON public.series FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Users can update their own series') THEN
        CREATE POLICY "Users can update their own series" ON public.series FOR UPDATE USING (auth.uid() = creator_id);
    END IF;

    -- Stories Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Public stories are viewable by everyone') THEN
        CREATE POLICY "Public stories are viewable by everyone" ON public.stories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can insert their own stories') THEN
        CREATE POLICY "Users can insert their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can delete their own stories') THEN
        CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Posts Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Public posts are viewable by everyone') THEN
        CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can insert their own posts') THEN
        CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Comments Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Public comments are viewable by everyone') THEN
        CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authenticated users can comment') THEN
        CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- View Logs Policies
    -- Drop existing insecure policy if it exists to replace it with the secure one
    DROP POLICY IF EXISTS "Users can insert view logs" ON public.view_logs;
    
    -- Create the secure INSERT policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'view_logs' AND policyname = 'Users can insert view logs') THEN
        CREATE POLICY "Users can insert view logs" ON public.view_logs 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated' AND viewer_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'view_logs' AND policyname = 'Users can view their own logs') THEN
        CREATE POLICY "Users can view their own logs" ON public.view_logs FOR SELECT USING (auth.uid() = viewer_id);
    END IF;
END
$$;

-- 4. Functions (OR REPLACE handles updates automatically)

-- Smart View Count Increment
CREATE OR REPLACE FUNCTION increment_view_count(target_id uuid, table_name text)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row_creator_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Validate table_name and get creator_id
  IF table_name = 'videos' THEN
    SELECT creator_id INTO row_creator_id FROM public.videos WHERE id = target_id;
  ELSIF table_name = 'posts' THEN
    SELECT user_id INTO row_creator_id FROM public.posts WHERE id = target_id;
  ELSE
    -- Exit if table_name is not allowed
    RETURN;
  END IF;

  -- Only increment if the viewer is NOT the creator
  IF (row_creator_id IS DISTINCT FROM current_user_id) THEN
    EXECUTE format('UPDATE public.%I SET views = views + 1 WHERE id = $1', table_name) USING target_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Like Count Increment
CREATE OR REPLACE FUNCTION increment_like_count(target_id uuid, table_name text)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name NOT IN ('videos', 'posts', 'comments') THEN
    RAISE EXCEPTION 'Invalid table name';
  END IF;
  
  EXECUTE format('UPDATE public.%I SET likes = likes + 1 WHERE id = $1', table_name) USING target_id;
END;
$$ LANGUAGE plpgsql;

-- Follower Count Increments (for Profiles)
CREATE OR REPLACE FUNCTION increment_follower_count(profile_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET followers = followers + 1 WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement Follower Count
CREATE OR REPLACE FUNCTION decrement_follower_count(profile_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET followers = GREATEST(0, followers - 1) WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Increment Series Total Episodes
CREATE OR REPLACE FUNCTION increment_total_episodes(series_id_input uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.series SET total_episodes = total_episodes + 1 WHERE id = series_id_input;
END;
$$ LANGUAGE plpgsql;

-- Register View (Logs view and increments count safely)
CREATE OR REPLACE FUNCTION register_view(video_id_input uuid, viewer_id_input uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the view if tracking history
  INSERT INTO public.view_logs (video_id, viewer_id)
  VALUES (video_id_input, viewer_id_input);

  -- Increment the video counter
  UPDATE public.videos SET views = views + 1 WHERE id = video_id_input;
END;
$$ LANGUAGE plpgsql;

-- Increment Story View
CREATE OR REPLACE FUNCTION increment_story_view(story_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories SET views = views + 1 WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Login Error Logging (Requested Schema)
-- Table to log login failures or invalid credential attempts
CREATE TABLE IF NOT EXISTS public.login_error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email_attempted text,
  error_message text DEFAULT 'Invalid login credentials',
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT login_error_logs_pkey PRIMARY KEY (id)
);

ALTER TABLE public.login_error_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'login_error_logs' AND policyname = 'Enable insert for anon') THEN
    CREATE POLICY "Enable insert for anon" ON public.login_error_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;
