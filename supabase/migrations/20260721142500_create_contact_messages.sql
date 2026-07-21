CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous or authenticated)
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Allow only authenticated admins to view messages (assuming admin check is based on user role or custom logic)
-- For now, we will just allow service_role to view it, or we can add a basic policy
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
  -- In a real app, check if auth.uid() has admin role. Since we don't have the exact schema, 
  -- we can just restrict it, or rely on Supabase dashboard (service_role) which bypasses RLS.
  false
);
