# 📊 Google Sheets Template - Fasting Plan Manager

Tento dokument popisuje štruktúru Google Sheets tabuľky potrebnú pre Fasting Plan Manager API.

## 🔧 Príprava Google Sheets

### Krok 1: Vytvor nový Google Sheets dokument
1. Choď na [Google Sheets](https://sheets.google.com)
2. Vytvor nový dokument (zelené tlačidlo "+")
3. Pomenuj ho: **"Fasting Plan Manager"**

### Krok 2: Vytvor 2 hárky

---

## 📋 HÁROK 1: "Fasting_Plan"

**Názov hárka:** `Fasting_Plan` (presne takto!)

### Hlavičky stĺpcov (riadok 1):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Dátum** | **Deň v týždni** | **Typ fastingu** | **Čas začiatku** | **Čas konca** | **Dĺžka fastingu** | **Stav** | **Hmotnosť ráno** | **Energia/pocit** | **Poznámka** |

### Popis stĺpcov:

- **A - Dátum:** Dátum vo formáte `DD.MM.YYYY` (napr. `30.10.2025`)
- **B - Deň v týždni:** Názov dňa (napr. `Pondelok`, `Utorok`, atď.)
- **C - Typ fastingu:** Typ fasting protokolu
  - Možnosti: `16:8`, `18:6`, `20:4`, `24h`, `Voľný deň`
- **D - Čas začiatku:** Čas začiatku fastingu vo formáte `HH:MM` (napr. `20:00`)
- **E - Čas konca:** Čas konca fastingu vo formáte `HH:MM` (napr. `12:00`)
- **F - Dĺžka fastingu:** Dĺžka v hodinách (napr. `16`, `18`, `24`)
- **G - Stav:** Aktuálny stav
  - Možnosti: `Naplánovaný`, `Dokončený`, `Vynechaný`
- **H - Hmotnosť ráno:** Hmotnosť v kg, slovenský formát (napr. `78,5`)
- **I - Energia/pocit:** Subjektívny pocit energie na škále 1-10 (napr. `8`)
- **J - Poznámka:** Voľný text pre poznámky (napr. `Cítim sa výborne!`)

### Príklad riadkov:

| Dátum | Deň v týždni | Typ fastingu | Čas začiatku | Čas konca | Dĺžka fastingu | Stav | Hmotnosť ráno | Energia/pocit | Poznámka |
|-------|--------------|--------------|--------------|-----------|----------------|------|---------------|---------------|----------|
| 30.10.2025 | Štvrtok | 16:8 | 20:00 | 12:00 | 16 | Dokončený | 78,5 | 8 | Cítim sa výborne! |
| 31.10.2025 | Piatok | 18:6 | 19:00 | 13:00 | 18 | Naplánovaný | | | |
| 01.11.2025 | Sobota | 16:8 | 20:00 | 12:00 | 16 | Vynechaný | 78,8 | 5 | Bol som na oslave |

### Formátovanie (odporúčané):

- **Hlavička (riadok 1):**
  - Tučné písmo
  - Pozadie: Modrá (#4285F4)
  - Text: Biely
  - Zarovnanie: Na stred
  - Zmrazený riadok (View → Freeze → 1 row)

- **Stĺpec A (Dátum):**
  - Formát: `DD.MM.YYYY`
  - Šírka: 100px

- **Stĺpec B (Deň v týždni):**
  - Šírka: 100px

- **Stĺpec G (Stav):**
  - Podmienené formátovanie:
    - "Dokončený" = Zelená (#B7E1CD)
    - "Naplánovaný" = Žltá (#FCE8B2)
    - "Vynechaný" = Červená (#F4C7C3)

---

## 🍴 HÁROK 2: "Planovane_Jedlo"

**Názov hárka:** `Planovane_Jedlo` (presne takto!)

### Hlavičky stĺpcov (riadok 1):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Dátum** | **Čas jedla** | **Typ jedla** | **Názov jedla** | **Kalórie** | **Bielkoviny** | **Sacharidy** | **Tuky** | **Poznámka** |

### Popis stĺpcov:

- **A - Dátum:** Dátum vo formáte `DD.MM.YYYY` (napr. `30.10.2025`)
- **B - Čas jedla:** Čas vo formáte `HH:MM` (napr. `13:00`)
- **C - Typ jedla:** Typ jedla
  - Možnosti: `Raňajky`, `Obed`, `Večera`, `Snack`
- **D - Názov jedla:** Názov/popis jedla (napr. `Kuracie prsia s ryžou`)
- **E - Kalórie:** Kalórie v kcal (napr. `650`)
- **F - Bielkoviny:** Bielkoviny v gramoch (napr. `45`)
- **G - Sacharidy:** Sacharidy v gramoch (napr. `60`)
- **H - Tuky:** Tuky v gramoch (napr. `15`)
- **I - Poznámka:** Voľný text pre poznámky (napr. `S brokolicou`)

### Príklad riadkov:

| Dátum | Čas jedla | Typ jedla | Názov jedla | Kalórie | Bielkoviny | Sacharidy | Tuky | Poznámka |
|-------|-----------|-----------|-------------|---------|------------|-----------|------|----------|
| 30.10.2025 | 12:00 | Obed | Kuracie prsia s ryžou | 650 | 45 | 60 | 15 | S brokolicou |
| 30.10.2025 | 19:00 | Večera | Losos s quinoa | 700 | 50 | 55 | 25 | Olivový olej |
| 31.10.2025 | 13:00 | Obed | Proteínová kaša | 430 | 30 | 40 | 12 | Ovsené vločky |

### Formátovanie (odporúčané):

- **Hlavička (riadok 1):**
  - Tučné písmo
  - Pozadie: Zelená (#34A853)
  - Text: Biely
  - Zarovnanie: Na stred
  - Zmrazený riadok (View → Freeze → 1 row)

- **Stĺpec C (Typ jedla):**
  - Podmienené formátovanie:
    - "Raňajky" = Oranžová (#FFEFD5)
    - "Obed" = Modrá (#DBEEF4)
    - "Večera" = Fialová (#E8DAEF)
    - "Snack" = Žltá (#FFF9C4)

---

## 🔗 Získanie Spreadsheet ID

Po vytvorení Google Sheets:

1. Otvor tabuľku
2. Pozri sa na URL v prehliadači:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
3. Skopíruj `SPREADSHEET_ID` (časť medzi `/d/` a `/edit`)
4. Ulož ju do `.env` súboru ako `SPREADSHEET_ID=...`

**Príklad:**
```
https://docs.google.com/spreadsheets/d/1QPFaYnHCLRU2nQVxd898mdQYD-pO7yfebIgmMg-L01A/edit
```
→ SPREADSHEET_ID = `1QPFaYnHCLRU2nQVxd898mdQYD-pO7yfebIgmMg-L01A`

---

## 🔐 Nastavenie Google Service Account

### Krok 1: Vytvor Service Account

1. Choď na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvor nový projekt (alebo použi existujúci)
3. Povoľ **Google Sheets API**:
   - APIs & Services → Library → Google Sheets API → Enable
4. Vytvor Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Zadaj názov: `fasting-manager-api`
   - Role: `Editor` (alebo minimálne prístup k Sheets)
5. Vytvor kľúč:
   - Klikni na vytvorený Service Account
   - Keys → Add Key → Create new key → JSON
   - Stiahne sa `credentials.json`

### Krok 2: Zdieľaj Google Sheets so Service Account

1. Otvor `credentials.json`
2. Nájdi pole `client_email` (napr. `fasting-manager-api@project.iam.gserviceaccount.com`)
3. Otvor svoj Google Sheets dokument
4. Klikni **Share** (Zdieľať)
5. Vlož Service Account email
6. Nastav práva na **Editor**
7. Odošli

### Krok 3: Zakóduj credentials do Base64

**Na Mac/Linux:**
```bash
base64 -i credentials.json
```

**Na Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials.json"))
```

**Výsledok skopíruj do `.env`:**
```
GOOGLE_CREDENTIALS_BASE64=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Hotovo!

Teraz máš:
- ✅ 2 hárky v Google Sheets (`Fasting_Plan`, `Planovane_Jedlo`)
- ✅ Správne formátované hlavičky
- ✅ Service Account s prístupom
- ✅ SPREADSHEET_ID a GOOGLE_CREDENTIALS_BASE64 v `.env`

Môžeš spustiť API server! 🚀

---

## 📝 Poznámky

- **Nemazať hlavičky** - API očakáva, že riadok 1 obsahuje hlavičky
- **Slovenský formát** - používaj čiarku pre desatinné čísla (78,5 nie 78.5)
- **Dátumy** - vždy DD.MM.YYYY formát
- **Časy** - vždy 24-hodinový formát HH:MM
- **Preto prázdne riadky** - API ich preskočí, ale odporúčam ich odstrániť


