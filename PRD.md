# PRD: Docházkový systém ADH-PLOTY

## Problém
Firma ADH-PLOTY potřebuje digitální evidenci docházky zaměstnanců. Zaměstnanci zapisují příchod, odchod a přestávku přes mobil, personalista sleduje a stahuje docházku do Excelu pro účetní.

## Cílový uživatel
Zaměstnanci firmy ADH-PLOTY (zápis přes mobil) a jeden admin z personálního oddělení (přehled, správa, export).

## User Stories
- Jako zaměstnanec chci zadat svoji docházku přes mobil, abych nemusel nosit papírové docházkové listy
- Jako zaměstnanec chci vidět moje odeslané záznamy, abych mohl zkontrolovat co jsem poslal
- Jako admin chci přidat nového zaměstnance a nastavit mu přihlašovací údaje
- Jako admin chci vidět přehled docházky za měsíc pro každého zaměstnance s automatickým výpočtem hodin
- Jako admin chci stáhnout docházku do Excelu pro účetní

## MVP Scope

### In scope
1. Přihlášení přes e-mail + heslo (Supabase Auth) — zaměstnanci i admin
2. Formulář pro zápis docházky (mobile-first, předvyplněné hodnoty: datum=dnes, od=07:00, do=16:00, přestávka=30 min)
3. Zaměstnanec vidí své odeslané záznamy (read-only)
4. Admin panel — správa zaměstnanců (vytvoření účtu, nastavení hesla)
5. Přehled docházky za měsíc — všechny dny seřazeny dle data, víkendy odlišeny, prázdné dny označeny
6. Automatický výpočet odpracovaných hodin a přesčasů/chybějících hodin (základ = 8h/den)
7. Export do Excelu — jeden soubor = jeden zaměstnanec × jeden měsíc

### Out of scope
- E-mailové připomínky a notifikace
- Schvalování docházky zaměstnancem
- Statistiky a grafy
- Více adminů nebo rolí
- Editace záznamu zaměstnancem (jen admin může upravovat)

## Výstupní sloupce (přehled a export)
| Sloupec | Popis |
|---------|-------|
| Čas zápisu | Kdy byl záznam odeslán |
| Jméno | Jméno zaměstnance |
| Datum | Datum pracovního dne |
| Od | Čas příchodu |
| Do | Čas odchodu |
| Přestávka | 0 / 30 / 60 minut |
| Celkem odpracováno | Výpočet: (Do − Od) − Přestávka |
| Přesčas | Kladné = přesčas, záporné = chybějící hodiny (základ 8h) |
| Poznámka | Místo výkonu práce |
| Akce | Editace záznamu (jen admin) |

## Datový model

### Tabulka: profiles
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | uuid (PK, ref auth.users) | Napojení na Supabase Auth |
| name | text | Jméno zaměstnance |
| role | text | 'admin' nebo 'employee' |
| created_at | timestamptz | Datum vytvoření |

### Tabulka: attendance_records
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK, identity) | Primární klíč |
| employee_id | uuid → profiles | Kdo záznam odeslal |
| date | date | Datum pracovního dne |
| time_from | time | Čas příchodu (default 07:00) |
| time_to | time | Čas odchodu (default 16:00) |
| break_minutes | integer | Přestávka: 0, 30 nebo 60 minut |
| location | text | Místo výkonu práce |
| hours_worked | numeric | Vypočítáno: (time_to − time_from) − přestávka |
| overtime | numeric | Vypočítáno: hours_worked − 8 |
| submitted_at | timestamptz | Kdy byl záznam odeslán |
| created_at | timestamptz | Interní timestamp |

## SQL pro Supabase

Viz `migrations/001_initial.sql`
