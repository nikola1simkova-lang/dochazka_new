# Úkoly — ADH-PLOTY Docházkový systém

## Hotovo ✅
- Setup (Node, Git, GitHub, Supabase, Vercel)
- PRD vytvořeno + GitHub issues
- Scaffold — Next.js 16 + Supabase + Tailwind
- Databáze: tabulky `profiles` + `attendance_records`
- Login funkční (admin: obchod@adh-ploty.cz)
- Admin panel přístupný
- `createEmployee` — po vytvoření auth uživatele se vloží profil do `profiles` (rollback při chybě)
- Editace záznamu adminem ✅
- GitHub přesunut pod firemní účet: github.com/plotyadh-code/dochazka_new ✅
- Supabase přesunut pod firemní účet (projekt jxostbtyqvjgpjujkevy) ✅
- Deploy na Vercel pod plotyadh-code's projects ✅

## Nutné před testováním 🔴

### 1. Otestovat přihlášení zaměstnance
- Přidat testovacího zaměstnance přes admin panel
- Přihlásit se jako zaměstnanec
- Zkusit zapsat docházku

### 2. Otestovat admin měsíční přehled
- Zobrazit docházku zaměstnance za měsíc
- Ověřit výpočet hodin a přesčasů
- Otestovat export do Excelu

## Hotovo (nové) ✅
- Převod přesčasových hodin do dalšího měsíce (per zaměstnanec per měsíc)
- Přesčasy na víkendy a státní svátky = všechny hodiny jsou přesčas
- Státní svátky ČR pro všechny roky vč. pohyblivých Velikonoc
- Tlačítko "Vyplnit pracovní dny" v adminu — vyplní prázdné Po–Pá (mimo svátky) hodnotami 07:00–16:00, přestávka 60 min
- Zaměstnanecká app: defaultní čas Od = 06:30, Do = 16:00, přestávka 30 min
- Sloupec `auto_filled` v `attendance_records` — zaměstnanec může přepsat automaticky vyplněný den, ale ne svůj již odeslaný záznam (migrace: 003_auto_filled.sql)

## Další kroky 🟡

### 3. Archivace dokumentů (Excel)
- Zachovat posledních 6 měsíců exportů na zaměstnance
- Starší záznamy archivovat (nemazat z DB, jen označit)

### 4. Svátky v měsíčním přehledu
- Řádek svátku barevně odlišit (stejně jako víkend)
- Hodiny počítat stejně jako pracovní den
- Seznam státních svátků ČR natvrdo nebo konfigurovatelně

## Poznámky
- Trigger `on_auth_user_created` byl smazán (způsoboval chyby) — profily vytváří app
- Admin účet: obchod@adh-ploty.cz (heslo v Supabase Auth)
- GitHub: github.com/plotyadh-code/dochazka_new
- Vercel: plotyadh-code's projects
- Supabase: projekt jxostbtyqvjgpjujkevy (firemní účet)
- Tabulka profiles má sloupce: id, name, role, email, initial_password, created_at
- Víkendy a svátky: hodiny se počítají stejně, jen řádek má jinou barvu
- Přesčasy: data připravuje appka, výpočet nuancí řeší účetní externě
