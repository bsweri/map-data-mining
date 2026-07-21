-- Tambahkan kebijakan agar Admin dapat memperbarui semua data di tabel profiles
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );
