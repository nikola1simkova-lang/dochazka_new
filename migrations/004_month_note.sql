-- Přidá sloupec pro poznámku ke každému měsíci zaměstnance
-- Spusť v Supabase SQL Editoru
ALTER TABLE monthly_overtime ADD COLUMN IF NOT EXISTS note text;
