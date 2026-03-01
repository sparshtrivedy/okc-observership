CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  birth_date DATE NOT NULL,
  country_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL,
  country TEXT NOT NULL,
  passport_issuing_country TEXT NOT NULL,
  us_status TEXT NOT NULL,
  medical_school TEXT NOT NULL,
  medical_school_country TEXT NOT NULL,
  academic_status TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  step1_result TEXT NOT NULL CHECK (step1_result IN ('Pass', 'Fail')),
  step2_score INTEGER,
  step3_score INTEGER,
  preferred_months TEXT[] NOT NULL DEFAULT '{}',
  opportunity_types TEXT[] NOT NULL DEFAULT '{}',
  setup_preference TEXT NOT NULL,
  specialty_preference TEXT NOT NULL DEFAULT '',
  accommodation_needed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Submitted',
  visa_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  travel_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  user_id BIGINT,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploads JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_graduation_year ON applicants(graduation_year);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE applicants ADD COLUMN IF NOT EXISTS user_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applicants_user_id_fkey'
  ) THEN
    ALTER TABLE applicants
    ADD CONSTRAINT applicants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF to_regclass('public.admin_users') IS NOT NULL THEN
    INSERT INTO users (email, password_hash, role, created_at, updated_at)
    SELECT username, password_hash, COALESCE(role, 'admin'), created_at, updated_at
    FROM admin_users
    ON CONFLICT (email) DO NOTHING;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS status_history (
  id BIGSERIAL PRIMARY KEY,
  applicant_id TEXT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_applicant_id ON status_history(applicant_id);

ALTER TABLE status_history ADD COLUMN IF NOT EXISTS changed_by_user_id BIGINT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'status_history'
      AND column_name = 'changed_by_admin_id'
  ) AND to_regclass('public.admin_users') IS NOT NULL THEN
    UPDATE status_history sh
    SET changed_by_user_id = u.id
    FROM admin_users au
    JOIN users u ON u.email = au.username
    WHERE sh.changed_by_admin_id = au.id
      AND sh.changed_by_user_id IS NULL;
  END IF;
END$$;

ALTER TABLE status_history DROP CONSTRAINT IF EXISTS status_history_changed_by_admin_id_fkey;
ALTER TABLE status_history DROP COLUMN IF EXISTS changed_by_admin_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'status_history_changed_by_user_id_fkey'
  ) THEN
    ALTER TABLE status_history
    ADD CONSTRAINT status_history_changed_by_user_id_fkey
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;

DROP TABLE IF EXISTS admin_users;
