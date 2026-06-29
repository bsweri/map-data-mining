-- Create Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create Enum for membership levels
CREATE TYPE public.membership_level AS ENUM ('free', 'silver', 'gold', 'platinum');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    current_membership public.membership_level DEFAULT 'free'::public.membership_level NOT NULL,
    membership_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Global Settings Table
CREATE TABLE public.global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for global_settings
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone."
  ON public.global_settings FOR SELECT
  USING ( true );

CREATE POLICY "Only admins can insert settings."
  ON public.global_settings FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Only admins can update settings."
  ON public.global_settings FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- 3. Membership Plans Table
CREATE TABLE public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level public.membership_level UNIQUE NOT NULL,
    price_idr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    discount_1_month NUMERIC DEFAULT 0,
    discount_3_months NUMERIC DEFAULT 25,
    discount_6_months NUMERIC DEFAULT 30,
    discount_12_months NUMERIC DEFAULT 35,
    daily_api_quota INTEGER NOT NULL,
    monthly_api_quota INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for membership_plans
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membership plans are viewable by everyone." ON public.membership_plans FOR SELECT USING ( true );
CREATE POLICY "Only admins can update plans." ON public.membership_plans FOR UPDATE USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Only admins can insert plans." ON public.membership_plans FOR INSERT WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- 4. API Usage Logs Table
CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if free user
    local_storage_id TEXT, -- For free users
    endpoint TEXT NOT NULL,
    ip_address TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for api_usage_logs
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own logs." ON public.api_usage_logs FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Admins can view all logs." ON public.api_usage_logs FOR SELECT USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
-- Insert policy typically handled by service role (Edge Function) so we can skip public insert policy

-- 5. Transactions Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL, -- 'midtrans' or 'lemonsqueezy'
    transaction_id TEXT UNIQUE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL, -- 'IDR' or 'USD'
    plan_level public.membership_level NOT NULL,
    duration_months INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'success', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Admins can view all transactions." ON public.transactions FOR SELECT USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Create trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, current_membership)
  VALUES (new.id, new.email, 'user', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert initial Global Settings & Plans
INSERT INTO public.global_settings (setting_key, setting_value, description)
VALUES ('free_user_global_limit', '{"monthly_api_requests": 10000}'::jsonb, 'Global limit for all free users combined');

INSERT INTO public.membership_plans (level, price_idr, price_usd, daily_api_quota, monthly_api_quota)
VALUES 
  ('free', 0, 0, 10, 100),
  ('silver', 99000, 6.99, 100, 3000),
  ('gold', 169000, 11.99, 500, 15000),
  ('platinum', 299000, 19.99, 2000, 60000);
