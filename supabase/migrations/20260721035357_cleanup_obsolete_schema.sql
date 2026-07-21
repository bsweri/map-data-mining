-- 1. Hapus tabel usang (obsolete)
DROP TABLE IF EXISTS public.global_settings CASCADE;
DROP TABLE IF EXISTS public.membership_plans CASCADE;

-- 2. Hapus kolom usang dari tabel profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS current_membership,
  DROP COLUMN IF EXISTS membership_expires_at;

-- 3. Hapus Tipe Enum usang (karena membership_plans sudah dihapus, enum ini tidak lagi dipakai)
DROP TYPE IF EXISTS public.membership_level CASCADE;
