-- Create function to update member status daily
CREATE OR REPLACE FUNCTION public.update_member_status_daily()
RETURNS void AS $$
DECLARE
    settings record;
BEGIN
    -- Get current admin settings
    SELECT * INTO settings FROM public.admin_settings LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 1. Update active members whose active_until has passed -> move to 'grace'
    UPDATE public.profiles
    SET status = 'grace'::public.user_status
    WHERE status = 'active'::public.user_status 
      AND active_until < NOW();

    -- 2. Update grace members whose grace period has passed -> move to 'off' and reset credit to 0
    UPDATE public.profiles
    SET status = 'off'::public.user_status,
        credit = 0
    WHERE status = 'grace'::public.user_status
      AND active_until + (settings.grace_period_days || ' days')::INTERVAL < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to distribute monthly free credit
CREATE OR REPLACE FUNCTION public.distribute_monthly_free_credit()
RETURNS void AS $$
DECLARE
    settings record;
BEGIN
    -- Get current admin settings
    SELECT * INTO settings FROM public.admin_settings LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Add free credit to all members, do not change their active_until
    UPDATE public.profiles
    SET credit = credit + settings.monthly_free_credit
    WHERE role = 'user'::public.app_role; -- Or whatever role defines members
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If pg_cron is enabled, we could schedule them like this:
-- SELECT cron.schedule('daily_status_check', '0 0 * * *', 'SELECT public.update_member_status_daily()');
-- SELECT cron.schedule('monthly_free_credit', '0 0 1 * *', 'SELECT public.distribute_monthly_free_credit()');
