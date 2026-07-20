-- 1. Create Enums for new status
CREATE TYPE public.user_status AS ENUM ('active', 'grace', 'off');

-- 2. Modify Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status public.user_status DEFAULT 'active'::public.user_status NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credit INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_until TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_extraction_at TIMESTAMPTZ;

-- Drop old columns that are no longer used (optional, keeping it for now just in case)
-- ALTER TABLE public.profiles DROP COLUMN current_membership;
-- ALTER TABLE public.profiles DROP COLUMN membership_expires_at;

-- 3. Create Admin Settings Table
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_free_credit INTEGER DEFAULT 120 NOT NULL,
    max_active_days INTEGER DEFAULT 365 NOT NULL,
    extraction_interval_seconds INTEGER DEFAULT 30 NOT NULL,
    ads_min_credit INTEGER DEFAULT 120 NOT NULL,
    grace_period_days INTEGER DEFAULT 30 NOT NULL,
    active_period_price_credit INTEGER DEFAULT 1000 NOT NULL,
    active_period_days_addition INTEGER DEFAULT 30 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one row exists
CREATE UNIQUE INDEX admin_settings_single_row ON public.admin_settings((1));

-- Insert default row
INSERT INTO public.admin_settings (monthly_free_credit, max_active_days, extraction_interval_seconds, ads_min_credit, grace_period_days, active_period_price_credit, active_period_days_addition)
VALUES (120, 365, 30, 120, 30, 1000, 30);

-- Enable RLS for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin settings viewable by everyone" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admin settings updatable by admins" ON public.admin_settings FOR UPDATE USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- 4. Create Credit Packages Table
CREATE TABLE public.credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credit_amount INTEGER NOT NULL,
    active_days_addition INTEGER NOT NULL,
    price_idr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial packages
INSERT INTO public.credit_packages (name, credit_amount, active_days_addition, price_idr, price_usd)
VALUES 
  ('Starter', 1200, 30, 99000, 6.99),
  ('Pro', 5000, 60, 169000, 11.99),
  ('Business', 57200, 90, 299000, 19.99);

-- Enable RLS for credit_packages
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Credit packages viewable by everyone" ON public.credit_packages FOR SELECT USING (true);
CREATE POLICY "Credit packages updatable by admins" ON public.credit_packages FOR UPDATE USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Credit packages insertable by admins" ON public.credit_packages FOR INSERT WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Credit packages deletable by admins" ON public.credit_packages FOR DELETE USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
