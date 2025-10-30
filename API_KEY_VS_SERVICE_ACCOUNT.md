# ⚠️ DÔLEŽITÉ: API Key vs Service Account

## Čo si práve vytvoril:

```
API Key: 5688e08805507eb2b2cc93cbec36d5753090f3a9
```

### ❌ Prečo toto NEFUNGUJE pre náš projekt:

API Key:
- Jednoduché "heslo" pre verejné API
- Nemá prístup k súkromným dátam (Google Sheets)
- Nemôže čítať/zapisovať do tvojho Sheets

Service Account:
- "Robot účet" s plnými oprávneniami
- Môže pristupovať k Sheets (ak je zdieľaný)
- Potrebujeme JSON súbor s private key

---

## ✅ SPRÁVNY POSTUP - Vytvor Service Account

### Krok 1: Choď do Credentials

Prejdi na: https://console.cloud.google.com/apis/credentials?project=fasting-projekt

### Krok 2: Vytvor Service Account

1. Klikni **"+ CREATE CREDENTIALS"** (modrá lišta hore)
2. Vyber **"Service account"** (tretia možnosť, NIE "API key")

### Krok 3: Vyplň informácie

**Service account details:**
- Service account name: `fasting-manager-api`
- Service account ID: (automaticky)
- Description: `API pre Fasting Manager`
- Klikni **"CREATE AND CONTINUE"**

**Grant this service account access to project:**
- Role: Môžeš vybrať "Editor" alebo preskočiť
- Klikni **"CONTINUE"**

**Grant users access to this service account:**
- Nechaj prázdne
- Klikni **"DONE"**

### Krok 4: Vytvor JSON kľúč

1. V zozname Credentials uvidíš "Service Accounts"
2. Klikni na email Service Account (napr. `fasting-manager-api@fasting-projekt.iam.gserviceaccount.com`)
3. Prejdi na tab **"KEYS"**
4. Klikni **"ADD KEY"** → **"Create new key"**
5. Vyber formát: **"JSON"**
6. Klikni **"CREATE"**

### ⬇️ Automaticky sa stiahne súbor!

Napr: `fasting-projekt-abc123def456.json`

Tento súbor vyzerá takto:
```json
{
  "type": "service_account",
  "project_id": "fasting-projekt",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "fasting-manager-api@fasting-projekt.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  ...
}
```

---

## 📋 Ďalšie kroky (až budeš mať JSON súbor)

1. ✅ Otvor JSON súbor
2. ✅ Skopíruj `client_email`
3. ✅ Zdieľaj Google Sheets s týmto emailom (Editor práva)
4. ✅ Zakóduj JSON do Base64
5. ✅ Vlož do `.env` súboru

---

## 🆘 Potrebuješ pomoc?

Keď budeš mať stiahnutý JSON súbor, daj mi vedieť a ukážem ti ako ho zakódovať!

---

## 🗑️ API Key môžeš zmazať (nepotrebujeme ho)

V Credentials → API Keys → Klikni na API key → DELETE


