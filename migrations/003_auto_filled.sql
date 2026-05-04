-- Označení automaticky vyplněných záznamů (tlačítkem "Vyplnit pracovní dny")
-- Zaměstnanec může přepsat pouze záznamy kde auto_filled = true

ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS auto_filled boolean NOT NULL DEFAULT false;
