# Úkoly — ADH-PLOTY Docházkový systém

## Hotovo ✅
- Setup (Node, Git, GitHub, Supabase, Vercel)
- PRD vytvořeno + GitHub issues
- Scaffold — Next.js 16 + Supabase + Tailwind
- Databáze: tabulky `profiles` + `attendance_records`
- Login funkční (admin: obchod@adh-ploty.cz)
- Admin panel přístupný

## Nutné před testováním 🔴

### 1. ~~Opravit vytváření zaměstnanců~~ ✅
`createEmployee` nyní po `auth.admin.createUser()` vloží profil do tabulky `profiles`.
Pokud INSERT selže, auth uživatel se automaticky smaže (rollback).

### 2. Otestovat přihlášení zaměstnance
- Přidat testovacího zaměstnance přes admin panel
- Přihlásit se jako zaměstnanec
- Zkusit zapsat docházku

### 3. Otestovat admin měsíční přehled
- Zobrazit docházku zaměstnance za měsíc
- Ověřit výpočet hodin a přesčasů
- Otestovat export do Excelu

## Další kroky 🟡

### 4. Deploy na Vercel
- Spustit `/hack-deploy`
- Nastavit env proměnné na Vercel
- Otestovat produkční verzi

### 5. Editace záznamu adminem
- V měsíčním přehledu chybí tlačítko pro editaci záznamu
- Admin by měl mít možnost opravit špatně zadanou docházku

### 6. Supabase pro klienta
- Až bude app otestovaná → přenést pod firemní účet ADH-PLOTY
- Vytvořit nové Supabase projekty (dev + prod)
- Spustit migrace v novém projektu

## Poznámky
- Trigger `on_auth_user_created` byl smazán (způsoboval chyby) — profily vytváří app
- Admin účet: obchod@adh-ploty.cz (heslo v Supabase Auth)
- Projekt: github.com/nikola1simkova-lang/dochazka_new
