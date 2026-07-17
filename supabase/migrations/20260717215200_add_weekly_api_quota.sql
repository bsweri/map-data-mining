-- Rename api_quota columns to credit_quota
ALTER TABLE public.membership_plans RENAME COLUMN daily_api_quota TO daily_credit_quota;
ALTER TABLE public.membership_plans RENAME COLUMN monthly_api_quota TO monthly_credit_quota;

-- Add weekly_credit_quota column to membership_plans table
ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS weekly_credit_quota INTEGER NOT NULL DEFAULT 0;
