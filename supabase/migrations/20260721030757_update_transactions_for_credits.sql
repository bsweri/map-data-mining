ALTER TABLE public.transactions 
  DROP COLUMN IF EXISTS plan_level,
  DROP COLUMN IF EXISTS duration_months,
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.fulfill_package_purchase(p_user_id UUID, p_package_id UUID)
RETURNS json AS $$
DECLARE
    v_package record;
    v_profile record;
    v_new_active_until TIMESTAMPTZ;
BEGIN
    -- Get package
    SELECT * INTO v_package FROM public.credit_packages WHERE id = p_package_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Package not found');
    END IF;

    -- Get profile
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Profile not found');
    END IF;

    -- Calculate new active_until
    IF v_profile.active_until IS NULL OR v_profile.active_until < NOW() THEN
        v_new_active_until := NOW() + (v_package.active_days_addition || ' days')::INTERVAL;
    ELSE
        v_new_active_until := v_profile.active_until + (v_package.active_days_addition || ' days')::INTERVAL;
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET credit = credit + v_package.credit_amount,
        active_until = v_new_active_until,
        status = 'active'::public.user_status
    WHERE id = p_user_id;

    RETURN json_build_object('success', true, 'new_active_until', v_new_active_until, 'new_credit', v_profile.credit + v_package.credit_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
