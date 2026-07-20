DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='membership_plans' AND column_name='daily_api_quota') THEN
        ALTER TABLE public.membership_plans RENAME COLUMN daily_api_quota TO daily_credit_quota;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='membership_plans' AND column_name='monthly_api_quota') THEN
        ALTER TABLE public.membership_plans RENAME COLUMN monthly_api_quota TO monthly_credit_quota;
    END IF;
END $$;

ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS weekly_credit_quota INTEGER NOT NULL DEFAULT 0;
