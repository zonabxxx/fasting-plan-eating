# 🔐 Google Cloud Setup - Krok po kroku

## Aktuálna situácia
Si v Google Cloud Console pre projekt "fasting projekt" ✅

## Kroky na dokončenie setup:

### 1. Povoľ Google Sheets API

1. V ľavom menu klikni na **"APIs & Services"** → **"Library"**
   - Alebo choď priamo: https://console.cloud.google.com/apis/library
2. V search bare vyhľadaj: **"Google Sheets API"**
3. Klikni na **"Google Sheets API"**
4. Klikni **"ENABLE"** (Povoliť)

### 2. Vytvor Service Account

1. V ľavom menu klikni na **"APIs & Services"** → **"Credentials"**
   - Alebo choď priamo: https://console.cloud.google.com/apis/credentials
2. Klikni na modrú lištu hore: **"+ CREATE CREDENTIALS"**
3. Vyber **"Service Account"**

### 3. Vyplň Service Account detaily

**Stránka 1: Service account details**
- Service account name: `fasting-manager-api`
- Service account ID: (automaticky sa vyplní)
- Description: `Service account pre Fasting Plan Manager API`
- Klikni **"CREATE AND CONTINUE"**

**Stránka 2: Grant this service account access to project**
- Role: Vyber **"Editor"** (alebo môžeš vynechať)
- Klikni **"CONTINUE"**

**Stránka 3: Grant users access to this service account**
- Nechaj prázdne
- Klikni **"DONE"**

### 4. Vytvor JSON kľúč

1. Na stránke "Credentials" uvidíš zoznam Service Accounts
2. Klikni na email tvojho Service Account (napr. `fasting-manager-api@...`)
3. Prejdi na tab **"KEYS"**
4. Klikni **"ADD KEY"** → **"Create new key"**
5. Vyber **"JSON"**
6. Klikni **"CREATE"**
7. **Automaticky sa stiahne súbor** `fasting-projekt-xxxxx.json` → ulož ho niekam bezpečne!

### 5. Zdieľaj Google Sheets so Service Account

1. Otvor stiahnutý JSON súbor
2. Nájdi pole `"client_email"` (vyzerá napríklad: `fasting-manager-api@fasting-projekt.iam.gserviceaccount.com`)
3. Skopíruj tento email
4. Otvor svoj Google Sheets dokument: https://docs.google.com/spreadsheets/d/1QPFaYnHCLRU2nQVxd898mdQYD-pO7yfebIgmMg-L01A/edit
5. Klikni **"Share"** (Zdieľať) vpravo hore
6. Vlož Service Account email
7. Nastav práva na **"Editor"**
8. Klikni **"Send"** (Odoslať)

### 6. Zakóduj JSON do Base64

**Na Mac (Terminal):**
```bash
cd ~/Downloads  # alebo kde máš stiahnutý JSON
base64 -i fasting-projekt-xxxxx.json | tr -d '\n' > credentials_base64.txt
```

**Výsledok:**
- Vytvorí sa súbor `credentials_base64.txt` s Base64 stringom
- Otvor ho a skopíruj celý obsah

### 7. Vytvor .env súbor

V priečinku projektu vytvor súbor `.env`:

```bash
cd "/Users/polepime.sk/Documents/cursor_workspace/stravovanie fasting"
nano .env
```

Vlož:
```env
SPREADSHEET_ID=1QPFaYnHCLRU2nQVxd898mdQYD-pO7yfebIgmMg-L01A
GOOGLE_CREDENTIALS_BASE64=tu_vlož_base64_string_z_credentials_base64.txt
API_KEY=moje_tajne_heslo_123
PORT=3000
NODE_ENV=development
SHEET_NAME_FASTING=Fasting
SHEET_NAME_JEDLO=Jedla
```

**Ulož:** Ctrl+O, Enter, Ctrl+X

### 8. Nainštaluj závislosti a spusti server

```bash
npm install
npm start
```

### 9. Otestuj

V novom terminále:
```bash
curl http://localhost:3000/health
```

Ak vidíš:
```json
{"status":"OK","timestamp":"...","service":"Fasting Plan Manager API"}
```

**Gratulujem! ✅ API funguje!**

---

## ⚠️ Dôležité poznámky

- **NIKDY** nepublikuj JSON súbor na GitHub/internet!
- **NIKDY** nezdieľaj Base64 string s nikým!
- JSON súbor ulož niekam bezpečne (napr. 1Password, LastPass)

---

## 🆘 Ak niečo nejde

Ozvi sa a ukáž mi error message!


