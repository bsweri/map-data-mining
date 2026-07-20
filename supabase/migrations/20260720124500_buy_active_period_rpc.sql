-- Create function to buy active period
CREATE OR REPLACE FUNCTION public.buy_active_period()
RETURNS json AS $$
DECLARE
    settings record;
    user_profile record;
    new_active_until TIMESTAMPTZ;
    added_days INTEGER;
    max_accumulated_date TIMESTAMPTZ;
BEGIN
    -- Get current admin settings
    SELECT * INTO settings FROM public.admin_settings LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Admin settings not found');
    END IF;

    -- Get user profile
    SELECT * INTO user_profile FROM public.profiles WHERE id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Profile not found');
    END IF;

    -- Check if user has enough credit
    IF user_profile.credit < settings.active_period_price_credit THEN
        RETURN json_build_object('success', false, 'error', 'Kredit tidak cukup untuk memperpanjang masa aktif');
    END IF;

    -- Calculate new active_until
    -- max accumulation is (current remaining active days + new active days) <= 365
    -- which means active_until cannot exceed NOW() + max_active_days
    max_accumulated_date := NOW() + (settings.max_active_days || ' days')::INTERVAL;
    
    IF user_profile.active_until IS NULL OR user_profile.active_until < NOW() THEN
        new_active_until := NOW() + (settings.active_period_days_addition || ' days')::INTERVAL;
    ELSE
        new_active_until := user_profile.active_until + (settings.active_period_days_addition || ' days')::INTERVAL;
    END IF;

    IF new_active_until > max_accumulated_date THEN
        RETURN json_build_object('success', false, 'error', 'Maksimal akumulasi masa aktif adalah ' || settings.max_active_days || ' hari');
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET credit = credit - settings.active_period_price_credit,
        active_until = new_active_until,
        status = 'active'::public.user_status
    WHERE id = auth.uid();

    RETURN json_build_object('success', true, 'new_active_until', new_active_until, 'new_credit', user_profile.credit - settings.active_period_price_credit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
