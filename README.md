# 🍽️ Fasting Plan Manager

> ChatGPT Agent pre správu intermittent fasting plánu s Google Sheets integráciou

Kompletný systém na zaznamenávanie a sledovanie intermittent fasting, plánovanie jedál, analýzu štatistík a motiváciu cez ChatGPT agenta.

---

## 🎯 Funkcie

- ✅ **Zaznamenávanie fastingu** - natural language input ("Dnes som fastoval 16 hodín, hmotnosť 78,5 kg")
- 📊 **Štatistiky a analytics** - týždenné, mesačné prehľady, trend hmotnosti
- 🍴 **Plánovanie jedál** - kalórie, makros, detailné jedálničky
- 💪 **Motivácia** - automatické gratulá cie, sledovanie progress
- 🌙 **Večerný check-in** - ChatGPT sa opýta každý večer na fasting
- 📈 **Trend hmotnosti** - lineárna regresia, percentuálne zmeny
- 🇸🇰 **Slovenský jazyk** - vrátane správnych formátov (DD.MM.YYYY, čiarka v číslach)

---

## 🏗️ Architektúra

```
┌─────────────────┐
│   ChatGPT Agent │ (s GPT Instructions)
└────────┬────────┘
         │
         │ HTTP REST API
         ▼
┌─────────────────┐
│  Node.js Server │ (Express + Google Sheets API)
└────────┬────────┘
         │
         │ Google Sheets API
         ▼
┌─────────────────┐
│  Google Sheets  │ (2 hárky: Fasting_Plan, Planovane_Jedlo)
└─────────────────┘
```

---

## 📋 Požiadavky

- **Node.js** >= 18.0.0
- **Google Cloud Project** s povoleným Google Sheets API
- **Google Service Account** s prístupom k tvojmu Sheets
- **Railway Account** (pre deployment) - alebo iný hosting

---

## 🚀 Inštalácia a Setup

### 1. Klonuj repository

```bash
cd "stravovanie fasting"
```

### 2. Nainštaluj závislosti

```bash
npm install
```

### 3. Vytvor Google Sheets

Podľa inštrukcií v [`GOOGLE_SHEETS_TEMPLATE.md`](./GOOGLE_SHEETS_TEMPLATE.md):

1. Vytvor nový Google Sheets dokument
2. Vytvor 2 hárky: `Fasting_Plan` a `Planovane_Jedlo`
3. Pridaj hlavičky stĺpcov (presne ako v template)
4. Získaj `SPREADSHEET_ID` z URL

### 4. Vytvor Google Service Account

1. Choď na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvor projekt
3. Povoľ **Google Sheets API**
4. Vytvor **Service Account** a stiahni JSON credentials
5. Zdieľaj svoj Google Sheets s Service Account emailom (s Editor právami)

### 5. Nastav environment variables

Vytvor `.env` súbor (skopíruj z `env.example`):

```bash
cp env.example .env
```

Vyplň hodnoty:

```env
SPREADSHEET_ID=tvoj_spreadsheet_id
GOOGLE_CREDENTIALS_BASE64=base64_encoded_credentials
API_KEY=tvoj_tajny_api_key (voliteľné)
PORT=3000
NODE_ENV=production
SHEET_NAME_FASTING=Fasting_Plan
SHEET_NAME_JEDLO=Planovane_Jedlo
```

**Ako zakódovať credentials do Base64:**

```bash
# Mac/Linux
base64 -i credentials.json

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials.json"))
```

### 6. Spusti server lokálne

```bash
npm start
```

alebo v dev móde (s auto-reload):

```bash
npm run dev
```

Server beží na `http://localhost:3000`

### 7. Otestuj API

```bash
# Health check
curl http://localhost:3000/health

# Dnešný fasting plán
curl http://localhost:3000/api/dnes

# Všetky fasting záznamy
curl http://localhost:3000/api/fasting

# Štatistiky
curl http://localhost:3000/api/statistiky
```

---

## 🌐 Deployment na Railway

### 1. Vytvor Railway projekt

1. Choď na [Railway.app](https://railway.app)
2. Prihlás sa cez GitHub
3. Klikni **New Project** → **Deploy from GitHub repo**
4. Vyber tento repository

### 2. Nastav environment variables

V Railway dashboarde:

- Klikni na svoj projekt
- **Variables** tab
- Pridaj všetky premenné z `.env`:
  - `SPREADSHEET_ID`
  - `GOOGLE_CREDENTIALS_BASE64`
  - `API_KEY`
  - `PORT` (Railway ho nastaví automaticky, môžeš vynechať)
  - `NODE_ENV=production`
  - `SHEET_NAME_FASTING=Fasting_Plan`
  - `SHEET_NAME_JEDLO=Planovane_Jedlo`

### 3. Deploy

- Railway automaticky detectne Node.js
- Spustí `npm install` a `npm start`
- Po deployi dostaneš URL (napr. `https://fasting-manager-production.up.railway.app`)

### 4. Otestuj production API

```bash
curl https://tvoja-app.up.railway.app/health
```

---

## 🤖 Nastavenie ChatGPT Agenta

### 1. Vytvor Custom GPT

1. Choď na [ChatGPT](https://chat.openai.com)
2. Klikni na svoje meno → **My GPTs** → **Create a GPT**
3. Názov: **Fasting Plan Manager** 🍽️
4. Popis: *"Tvoj osobný asistent pre intermittent fasting. Zaznamenám fasting, plánujem jedlá, analyzujem štatistiky a motivujem ťa! 💪"*

### 2. Vlož GPT Instructions

Skopíruj celý obsah súboru [`GPT_INSTRUCTIONS.md`](./GPT_INSTRUCTIONS.md) do poľa **Instructions**.

### 3. Pridaj OpenAPI Schema

1. Klikni **Add Actions**
2. Klikni **Import from URL** alebo **Paste OpenAPI schema**
3. Vlož URL: `https://tvoja-app.up.railway.app/openapi.yaml`
   - Alebo skopíruj obsah [`openapi.yaml`](./openapi.yaml)
4. Railway URL zmeň na tvoju production URL
5. Klikni **Save**

### 4. Nastav Conversation Starters

Pridaj tieto starter otázky:

```
1. "Zaznamenaj dnešný fasting"
2. "Aký je môj týždenný progress?"
3. "Naplánuj jedlo na zajtra"
4. "Ukáž mi trend hmotnosti"
```

### 5. Nastavenia GPT

- **Capabilities:**
  - ✅ Web Browsing: OFF
  - ✅ DALL·E Image Generation: OFF
  - ✅ Code Interpreter: OFF
  
- **Additional Settings:**
  - **Temperature:** 0.7 (vyvážené medzi kreativitou a presnosťou)
  - **Privacy:** Podľa tvojho uváženia (Private / Public)

### 6. Testuj GPT agenta

Otvor konverzáciu a vyskúšaj:

```
"Ahoj, ako sa mám dnes?"
```

Agent automaticky načíta dnešný fasting plán a privíta ťa! 🌅

---

## 📚 API Dokumentácia

### Base URL

```
Production: https://tvoja-app.up.railway.app
Local:      http://localhost:3000
```

### Endpointy

#### 🏥 Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-30T10:30:00.000Z",
  "service": "Fasting Plan Manager API"
}
```

---

#### 📅 Dnešný fasting plán

```http
GET /api/dnes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "existuje": true,
    "datum": "30.10.2025",
    "denVTyzdni": "Štvrtok",
    "typFastingu": "16:8",
    "casZaciatku": "20:00",
    "casKonca": "12:00",
    "dlzkaFastingu": "16",
    "stav": "Naplánovaný",
    "hmotnost": "",
    "energia": "",
    "poznamka": ""
  }
}
```

---

#### 📊 Všetky fasting záznamy

```http
GET /api/fasting
```

**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "datum": "30.10.2025",
      "denVTyzdni": "Štvrtok",
      "typFastingu": "16:8",
      "casZaciatku": "20:00",
      "casKonca": "12:00",
      "dlzkaFastingu": "16",
      "stav": "Dokončený",
      "hmotnost": "78,5",
      "energia": "8",
      "poznamka": "Cítim sa výborne!"
    }
  ]
}
```

---

#### 🔍 Detail fasting dňa

```http
GET /api/fasting/:datum
```

**Params:**
- `datum` - Dátum vo formáte DD.MM.YYYY (napr. `30.10.2025`)

**Example:**
```bash
curl http://localhost:3000/api/fasting/30.10.2025
```

---

#### ✍️ Pridať/updatovať fasting záznam

```http
POST /api/fasting
Content-Type: application/json
```

**Body:**
```json
{
  "datum": "30.10.2025",
  "typFastingu": "16:8",
  "casZaciatku": "20:00",
  "casKonca": "12:00",
  "dlzkaFastingu": "16",
  "stav": "Dokončený",
  "hmotnost": "78,5",
  "energia": "8",
  "poznamka": "Cítim sa výborne!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Záznam pre 30.10.2025 bol aktualizovaný",
  "data": { ... }
}
```

---

#### 🍴 Všetky plánované jedlá

```http
GET /api/jedlo
```

---

#### ✍️ Pridať jedlo

```http
POST /api/jedlo
Content-Type: application/json
```

**Body:**
```json
{
  "datum": "30.10.2025",
  "casJedla": "13:00",
  "typJedla": "Obed",
  "nazovJedla": "Kuracie prsia s ryžou",
  "kalorie": "650",
  "bielkoviny": "45",
  "sacharidy": "60",
  "tuky": "15",
  "poznamka": "S brokolicou"
}
```

---

#### 📈 Štatistiky

```http
GET /api/statistiky           # Celkové štatistiky
GET /api/analytics/tyzdenne   # Týždenný prehľad
GET /api/analytics/mesacne    # Mesačný prehľad
GET /api/analytics/hmotnost   # Trend hmotnosti
```

**Example Response (štatistiky):**
```json
{
  "success": true,
  "data": {
    "celkemZaznamov": 150,
    "dokoncene": 112,
    "vynechane": 8,
    "naplanovane": 30,
    "uspesnost": "74.7%",
    "celkoveHodinyFastingu": "1890,5",
    "priemernaDelkaFastingu": "16,9 hodín",
    "trendHmotnosti": "Klesajúci 📉 (výborne!)",
    "aktualnaHmotnost": "78,5"
  }
}
```

---

## 🛠️ Technológie

- **Backend:** Node.js + Express
- **API:** RESTful API
- **Database:** Google Sheets (cez Google Sheets API v4)
- **Validácia:** express-validator
- **Dátum/čas:** date-fns
- **Deployment:** Railway.app
- **AI Agent:** ChatGPT (Custom GPT s Actions)

---

## 📁 Štruktúra projektu

```
stravovanie fasting/
├── server.js                    # Hlavný backend server
├── package.json                 # NPM závislosti
├── env.example                  # Template pre environment variables
├── openapi.yaml                 # OpenAPI schema pre ChatGPT
├── GPT_INSTRUCTIONS.md          # Inštrukcie pre ChatGPT agenta
├── GOOGLE_SHEETS_TEMPLATE.md    # Template Google Sheets štruktúry
└── README.md                    # Táto dokumentácia
```

---

## 🔒 Bezpečnosť

### API Key (voliteľné)

Ak chceš zabezpečiť API, nastav `API_KEY` v `.env`:

```env
API_KEY=super_tajny_heslo_12345
```

Potom pri každom requeste pridaj header:

```bash
curl -H "X-API-Key: super_tajny_heslo_12345" \
  https://tvoja-app.up.railway.app/api/fasting
```

### Service Account Permissions

- Service Account má prístup **len k Google Sheets**, ktoré si s ním zdieľal
- Credentials sú uložené ako Base64 v environment variables
- **NIKDY** nepublikuj `credentials.json` na GitHub!

---

## 🐛 Troubleshooting

### Problém: "Error: Unable to load credentials"

**Riešenie:**
- Skontroluj, či `GOOGLE_CREDENTIALS_BASE64` je správne zakódované
- Skúsi znova zakódovať `credentials.json`:
  ```bash
  base64 -i credentials.json | tr -d '\n'
  ```
- Uisti sa, že v Base64 stringu nie sú medzery ani nové riadky

### Problém: "Error: The caller does not have permission"

**Riešenie:**
- Google Sheets musí byť zdieľaný so Service Account emailom
- Service Account email nájdeš v `credentials.json` pod `client_email`
- Zdieľaj Sheets s **Editor** právami

### Problém: "Error: Spreadsheet not found"

**Riešenie:**
- Skontroluj `SPREADSHEET_ID` v `.env`
- ID musí byť časť URL medzi `/d/` a `/edit`
- Uisti sa, že Sheets existuje a je zdieľaný

### Problém: ChatGPT nevie volať API

**Riešenie:**
- Skontroluj, či Railway URL je správne nastavená v OpenAPI schema
- Otestuj API manuálne cez `curl` alebo Postman
- Skontroluj, či Actions sú správne nakonfigurované v ChatGPT

---

## 🎨 Prispôsobenie

### Zmena názvov hárkov

V `.env`:
```env
SHEET_NAME_FASTING=MojFasting
SHEET_NAME_JEDLO=MojeJedla
```

### Pridanie nových endpointov

1. Pridaj endpoint do `server.js`
2. Aktualizuj `openapi.yaml`
3. Aktualizuj `GPT_INSTRUCTIONS.md` s novými funkciami

### Zmena formátu dátumov

V `server.js` zmeň funkcie:
```javascript
function formatDatumSK(date) {
  return format(date, 'YYYY-MM-DD'); // Namiesto 'dd.MM.yyyy'
}
```

---

## 📊 Príklady použitia

### 1. Zaznamenanie dnešného fastingu

**ChatGPT:**
```
Užívateľ: "Dnes som fastoval 16 hodín, hmotnosť 78,5 kg, cítim sa super"

Agent: "Super! ✅ Zaznamenal som tvoj 16-hodinový fasting. 
Hmotnosť 78,5 kg. Výborne! 💪"
```

### 2. Týždenný progress

**ChatGPT:**
```
Užívateľ: "Ako som na tom tento týždeň?"

Agent: "📊 Týždenný prehľad (27.10 - 03.11):

✅ Dokončené dni: 5 z 7
⏰ Celkový fasting: 85,5 hodín
📊 Priemerná dĺžka: 17,1 hodín
💪 Úspešnosť: 71%

Výborne! Pokračuj ďalej! 🚀"
```

### 3. Plánovanie jedla

**ChatGPT:**
```
Užívateľ: "Naplánuj na zajtra obed: losos s quinoa, 700 kcal"

Agent: "Perfektne! 🐟 Naplánoval som obed na zajtra o 12:00:
• Losos s quinoa
• 700 kcal
• Zdravé omega-3! Dobrú chuť! 😋"
```

---

## 🤝 Podpora

Ak máš otázky alebo problémy:

1. Skontroluj [Troubleshooting](#-troubleshooting)
2. Otestuj API manuálne cez `curl`
3. Skontroluj Railway logs (Dashboard → Deployments → Logs)

---

## 📝 Licencia

MIT License - Slobodne použiteľné pre osobné aj komerčné účely.

---

## 🎉 Hotovo!

Teraz máš kompletný Fasting Plan Manager! 

**Ďalšie kroky:**
1. ✅ Spusti server lokálne a otestuj
2. ✅ Deployni na Railway
3. ✅ Nastav ChatGPT agenta
4. ✅ Začni fastovať a sleduj progress! 💪

**Verzia:** 1.0.0  
**Dátum:** 30.10.2025  
**Autor:** AI Powered 🚀


