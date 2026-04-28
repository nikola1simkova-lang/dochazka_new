-- Docházkový systém ADH-PLOTY
-- Spusť v Supabase SQL Editoru (DEV projekt)
-- Po deploymentu spusť stejný SQL i v PROD projektu

-- Profily uživatelů (rozšíření Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_allow_all" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Záznamy docházky
CREATE TABLE attendance_records (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_from time NOT NULL DEFAULT '07:00',
  time_to time NOT NULL DEFAULT '16:00',
  break_minutes integer NOT NULL DEFAULT 30 CHECK (break_minutes IN (0, 30, 60)),
  location text,
  hours_worked numeric(4,2) GENERATED ALWAYS AS (
    ROUND(
      (EXTRACT(EPOCH FROM (time_to - time_from)) / 3600.0 - break_minutes / 60.0)::numeric,
      2
    )
  ) STORED,
  overtime numeric(4,2) GENERATED ALWAYS AS (
    ROUND(
      (EXTRACT(EPOCH FROM (time_to - time_from)) / 3600.0 - break_minutes / 60.0 - 8.0)::numeric,
      2
    )
  ) STORED,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, date)
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_records_allow_all" ON attendance_records
  FOR ALL USING (true) WITH CHECK (true);
