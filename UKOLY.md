# Úkoly — ADH-PLOTY Docházkový systém

## Hotovo ✅
- Setup (Node, Git, GitHub, Supabase, Vercel)
- PRD vytvořeno + GitHub issues
- Scaffold — Next.js 16 + Supabase + Tailwind
- Databáze: tabulky `profiles` + `attendance_records`
- Login funkční (admin: obchod@adh-ploty.cz)
- Admin panel přístupný
- `createEmployee` — po vytvoření auth uživatele se vloží profil do `profiles` (rollback při chybě)

## Nutné před testováním 🔴

### 1. Otestovat přihlášení zaměstnance
- Přidat testovacího zaměstnance přes admin panel
- Přihlásit se jako zaměstnanec
- Zkusit zapsat docházku

### 2. Otestovat admin měsíční přehled
- Zobrazit docházku zaměstnance za měsíc
- Ověřit výpočet hodin a přesčasů
- Otestovat export do Excelu

## Další kroky 🟡

### 3. Editace záznamu adminem
- V měsíčním přehledu chybí tlačítko pro editaci záznamu
- Admin by měl mít možnost opravit špatně zadanou docházku

### 4. Archivace dokumentů (Excel)
- Zachovat posledních 6 měsíců exportů na zaměstnance
- Starší záznamy archivovat (nemazat z DB, jen označit)

### 5. Svátky v měsíčním přehledu
- Řádek svátku barevně odlišit (stejně jako víkend)
- Hodiny počítat stejně jako pracovní den
- Seznam státních svátků ČR natvrdo nebo konfigurovatelně

### 6. Deploy na Vercel
- Spustit `/hack-deploy`
- Nastavit env proměnné na Vercel
- Otestovat produkční verzi

### 7. Supabase pro klienta
- Až bude app otestovaná → přenést pod firemní účet ADH-PLOTY
- Vytvořit nové Supabase projekty (dev + prod)
- Spustit migrace v novém projektu

## Poznámky
- Trigger `on_auth_user_created` byl smazán (způsoboval chyby) — profily vytváří app
- Admin účet: obchod@adh-ploty.cz (heslo v Supabase Auth)
- Projekt: github.com/nikola1simkova-lang/dochazka_new
- Víkendy a svátky: hodiny se počítají stejně, jen řádek má jinou barvu
- Přesčasy: data připravuje appka, výpočet nuancí řeší účetní externě
