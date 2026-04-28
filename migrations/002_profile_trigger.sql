-- Přidání e-mailu do profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Trigger: automaticky vytvoří profil při registraci uživatele
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Pro manuální vytvoření admin profilu:
-- Nejdřív vytvoř admin uživatele v Supabase Auth (dashboard → Authentication → Users → Add user)
-- Pak spusť tento INSERT s UUID z Auth:
-- INSERT INTO profiles (id, name, email, role)
-- VALUES ('<uuid>', 'Jméno Admina', 'admin@email.cz', 'admin');
