import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { body, param, validationResult } from 'express-validator';
import { format, parse, parseISO, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { sk } from 'date-fns/locale';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets Setup
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME_FASTING = process.env.SHEET_NAME_FASTING || 'Fasting_Plan';
const SHEET_NAME_JEDLO = process.env.SHEET_NAME_JEDLO || 'Planovane_Jedlo';

let sheets;

// Initialize Google Sheets API
function initializeGoogleSheets() {
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API inicializované');
  } catch (error) {
    console.error('❌ Chyba pri inicializácii Google Sheets API:', error.message);
    throw error;
  }
}

// Helper funkcie pre slovenský formát
function formatDatumSK(date) {
  return format(date, 'dd.MM.yyyy');
}

function parseDatumSK(datumStr) {
  return parse(datumStr, 'dd.MM.yyyy', new Date());
}

function formatCasSK(date) {
  return format(date, 'HH:mm');
}

function formatCisloSK(cislo) {
  return cislo.toString().replace('.', ',');
}

function parseCisloSK(cisloStr) {
  return parseFloat(cisloStr.toString().replace(',', '.'));
}

// Funkcia na zmenu farby riadku podľa stavu
async function updateRowColor(rowIndex, stav) {
  try {
    // Získaj ID hárku "Fasting"
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheet = sheetMetadata.data.sheets.find(
      s => s.properties.title === SHEET_NAME_FASTING
    );
    
    if (!sheet) {
      console.error('Hárok nebol nájdený');
      return;
    }
    
    const sheetId = sheet.properties.sheetId;
    
    // Definuj farby podľa stavu
    let backgroundColor;
    
    switch (stav) {
      case 'Dokončený':
        backgroundColor = { red: 0.8, green: 1.0, blue: 0.8 }; // Svetlo zelená
        break;
      case 'Vynechaný':
        backgroundColor = { red: 1.0, green: 0.8, blue: 0.8 }; // Svetlo červená
        break;
      case 'Naplánovaný':
        backgroundColor = { red: 1.0, green: 1.0, blue: 0.8 }; // Svetlo žltá
        break;
      default:
        backgroundColor = { red: 1.0, green: 1.0, blue: 1.0 }; // Biela
    }
    
    // Použij batchUpdate na zmenu farby
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: rowIndex - 1,
                endRowIndex: rowIndex,
                startColumnIndex: 0,
                endColumnIndex: 10
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: backgroundColor
                }
              },
              fields: 'userEnteredFormat.backgroundColor'
            }
          }
        ]
      }
    });
    
    console.log(`✅ Farba riadku ${rowIndex} zmenená na: ${stav}`);
  } catch (error) {
    console.error('❌ Chyba pri zmene farby riadku:', error.message);
    // Nezastavujeme celý proces kvôli chybe farby
  }
}


// API Key middleware (voliteľné)
function checkApiKey(req, res, next) {
  const apiKey = process.env.API_KEY;
  if (apiKey && req.headers['x-api-key'] !== apiKey) {
    return res.status(401).json({ error: 'Neplatný API kľúč' });
  }
  next();
}

// Validácia middleware
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ========== ENDPOINTY ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Fasting Plan Manager API'
  });
});

// GET /api/fasting - Všetky záznamy fastingu
app.get('/api/fasting', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    const zaznamy = rows.map(row => ({
      datum: row[0] || '',
      denVTyzdni: row[1] || '',
      typFastingu: row[2] || '',
      casZaciatku: row[3] || '',
      casKonca: row[4] || '',
      dlzkaFastingu: row[5] || '',
      stav: row[6] || '',
      hmotnost: row[7] || '',
      energia: row[8] || '',
      poznamka: row[9] || ''
    }));

    res.json({
      success: true,
      count: zaznamy.length,
      data: zaznamy
    });
  } catch (error) {
    console.error('Chyba pri načítaní fasting záznamov:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri načítaní dát z Google Sheets',
      details: error.message 
    });
  }
});

// GET /api/fasting/:datum - Detail dňa
app.get('/api/fasting/:datum', [
  param('datum').matches(/^\d{2}\.\d{2}\.\d{4}$/).withMessage('Dátum musí byť vo formáte DD.MM.YYYY')
], validate, async (req, res) => {
  try {
    const { datum } = req.params;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    const zaznam = rows.find(row => row[0] === datum);

    if (!zaznam) {
      return res.status(404).json({ 
        success: false, 
        error: `Záznam pre dátum ${datum} nebol najdeny` 
      });
    }

    res.json({
      success: true,
      data: {
        datum: zaznam[0] || '',
        denVTyzdni: zaznam[1] || '',
        typFastingu: zaznam[2] || '',
        casZaciatku: zaznam[3] || '',
        casKonca: zaznam[4] || '',
        dlzkaFastingu: zaznam[5] || '',
        stav: zaznam[6] || '',
        hmotnost: zaznam[7] || '',
        energia: zaznam[8] || '',
        poznamka: zaznam[9] || ''
      }
    });
  } catch (error) {
    console.error('Chyba pri načítaní záznamu:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri načítaní dát',
      details: error.message 
    });
  }
});

// POST /api/fasting - Aktualizovať existujúci záznam fastingu
app.post('/api/fasting', [
  body('datum').matches(/^\d{2}\.\d{2}\.\d{4}$/).withMessage('Dátum musí byť vo formáte DD.MM.YYYY'),
  body('typFastingu').optional().isString(),
  body('casZaciatku').optional().matches(/^\d{2}:\d{2}$/).withMessage('Čas začiatku musí byť vo formáte HH:MM'),
  body('casKonca').optional().matches(/^\d{2}:\d{2}$/).withMessage('Čas konca musí byť vo formáte HH:MM'),
  body('dlzkaFastingu').optional().isString(),
  body('stav').optional().isIn(['Naplánovaný', 'Dokončený', 'Vynechaný']),
  body('hmotnost').optional().isString(),
  body('energia').optional().isString(),
  body('poznamka').optional().isString()
], validate, async (req, res) => {
  try {
    const { 
      datum, 
      typFastingu, 
      casZaciatku, 
      casKonca, 
      dlzkaFastingu, 
      stav, 
      hmotnost, 
      energia, 
      poznamka 
    } = req.body;

    // Validácia hmotnosti
    if (hmotnost) {
      const hmotnostNum = parseCisloSK(hmotnost);
      if (hmotnostNum < 40 || hmotnostNum > 200) {
        return res.status(400).json({ 
          success: false, 
          error: 'Hmotnosť musí byť medzi 40-200 kg' 
        });
      }
    }

    // Validácia energie
    if (energia) {
      const energiaNum = parseInt(energia);
      if (energiaNum < 1 || energiaNum > 10) {
        return res.status(400).json({ 
          success: false, 
          error: 'Energia musí byť medzi 1-10' 
        });
      }
    }

    // Získaj existujúce záznamy
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    const existingIndex = rows.findIndex(row => row[0] === datum);

    // Deň musí už existovať v Sheets
    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Dátum ${datum} nebol nájdený v pláne. Najprv vytvorte plán v Google Sheets.`
      });
    }

    // UPDATE existujúceho záznamu (len stĺpce, ktoré sú poslané)
    const existingRow = rows[existingIndex];
    const updatedRow = [
      datum,
      existingRow[1], // Deň v týždni nemením
      typFastingu !== undefined ? typFastingu : existingRow[2] || '',
      casZaciatku !== undefined ? casZaciatku : existingRow[3] || '',
      casKonca !== undefined ? casKonca : existingRow[4] || '',
      dlzkaFastingu !== undefined ? dlzkaFastingu : existingRow[5] || '',
      stav !== undefined ? stav : existingRow[6] || '',
      hmotnost !== undefined ? hmotnost : existingRow[7] || '',
      energia !== undefined ? energia : existingRow[8] || '',
      poznamka !== undefined ? poznamka : existingRow[9] || ''
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A${existingIndex + 2}:J${existingIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow]
      }
    });

    // Zmeň farbu riadku podľa stavu
    const finalStav = stav !== undefined ? stav : existingRow[6];
    await updateRowColor(existingIndex + 2, finalStav);

    res.json({
      success: true,
      message: `Záznam pre ${datum} bol aktualizovaný`,
      data: {
        datum: updatedRow[0],
        denVTyzdni: updatedRow[1],
        typFastingu: updatedRow[2],
        casZaciatku: updatedRow[3],
        casKonca: updatedRow[4],
        dlzkaFastingu: updatedRow[5],
        stav: updatedRow[6],
        hmotnost: updatedRow[7],
        energia: updatedRow[8],
        poznamka: updatedRow[9]
      }
    });
  } catch (error) {
    console.error('Chyba pri ukladaní záznamu:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri ukladaní dát',
      details: error.message 
    });
  }
});

// GET /api/jedlo - Všetky plánované jedlá
app.get('/api/jedlo', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_JEDLO}!A2:I`,
    });

    const rows = response.data.values || [];
    const jedla = rows.map(row => ({
      datum: row[0] || '',
      casJedla: row[1] || '',
      typJedla: row[2] || '',
      nazovJedla: row[3] || '',
      kalorie: row[4] || '',
      bielkoviny: row[5] || '',
      sacharidy: row[6] || '',
      tuky: row[7] || '',
      poznamka: row[8] || ''
    }));

    res.json({
      success: true,
      count: jedla.length,
      data: jedla
    });
  } catch (error) {
    console.error('Chyba pri načítaní jedál:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri načítaní dát z Google Sheets',
      details: error.message 
    });
  }
});

// POST /api/jedlo - Pridať jedlo
app.post('/api/jedlo', [
  body('datum').matches(/^\d{2}\.\d{2}\.\d{4}$/).withMessage('Dátum musí byť vo formáte DD.MM.YYYY'),
  body('casJedla').matches(/^\d{2}:\d{2}$/).withMessage('Čas jedla musí byť vo formáte HH:MM'),
  body('typJedla').isIn(['Raňajky', 'Obed', 'Večera', 'Snack']).withMessage('Typ jedla musí byť jeden z: Raňajky, Obed, Večera, Snack'),
  body('nazovJedla').notEmpty().withMessage('Názov jedla je povinný'),
  body('kalorie').optional().isString(),
  body('bielkoviny').optional().isString(),
  body('sacharidy').optional().isString(),
  body('tuky').optional().isString(),
  body('poznamka').optional().isString()
], validate, async (req, res) => {
  try {
    const { 
      datum, 
      casJedla, 
      typJedla, 
      nazovJedla, 
      kalorie, 
      bielkoviny, 
      sacharidy, 
      tuky, 
      poznamka 
    } = req.body;

    const newRow = [
      datum,
      casJedla,
      typJedla,
      nazovJedla,
      kalorie || '',
      bielkoviny || '',
      sacharidy || '',
      tuky || '',
      poznamka || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_JEDLO}!A2:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow]
      }
    });

    res.json({
      success: true,
      message: `Jedlo ${nazovJedla} bolo pridané na ${datum} o ${casJedla}`,
      data: {
        datum: newRow[0],
        casJedla: newRow[1],
        typJedla: newRow[2],
        nazovJedla: newRow[3],
        kalorie: newRow[4],
        bielkoviny: newRow[5],
        sacharidy: newRow[6],
        tuky: newRow[7],
        poznamka: newRow[8]
      }
    });
  } catch (error) {
    console.error('Chyba pri pridávaní jedla:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri ukladaní dát',
      details: error.message 
    });
  }
});

// GET /api/statistiky - Základné štatistiky
app.get('/api/statistiky', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    
    let celkemZaznamov = rows.length;
    let dokoncene = 0;
    let vynechane = 0;
    let celkoveHodinyFastingu = 0;
    let pocetHodin = 0;
    let hmotnosti = [];
    
    rows.forEach(row => {
      const stav = row[6];
      const dlzkaStr = row[5];
      const hmotnostStr = row[7];

      if (stav === 'Dokončený') dokoncene++;
      if (stav === 'Vynechaný') vynechane++;

      // Spočítaj hodiny fastingu
      if (dlzkaStr && stav === 'Dokončený') {
        const hodiny = parseCisloSK(dlzkaStr);
        if (!isNaN(hodiny)) {
          celkoveHodinyFastingu += hodiny;
          pocetHodin++;
        }
      }

      // Zbieraj hmotnosti
      if (hmotnostStr) {
        const hmotnost = parseCisloSK(hmotnostStr);
        const datum = row[0];
        if (!isNaN(hmotnost) && datum) {
          hmotnosti.push({ datum, hmotnost });
        }
      }
    });

    const uspesnost = celkemZaznamov > 0 ? ((dokoncene / celkemZaznamov) * 100).toFixed(1) : 0;
    const priemernaDelka = pocetHodin > 0 ? (celkoveHodinyFastingu / pocetHodin).toFixed(1) : 0;

    // Trend hmotnosti (jednoduchá lineárna regresia)
    let trendHmotnosti = 'Stabilný';
    if (hmotnosti.length >= 2) {
      const prvaHmotnost = hmotnosti[0].hmotnost;
      const poslednaHmotnost = hmotnosti[hmotnosti.length - 1].hmotnost;
      const rozdiel = poslednaHmotnost - prvaHmotnost;
      
      if (rozdiel < -0.5) trendHmotnosti = 'Klesajúci 📉';
      else if (rozdiel > 0.5) trendHmotnosti = 'Rastúci 📈';
      else trendHmotnosti = 'Stabilný ➡️';
    }

    res.json({
      success: true,
      data: {
        celkemZaznamov,
        dokoncene,
        vynechane,
        naplanovane: celkemZaznamov - dokoncene - vynechane,
        uspesnost: `${uspesnost}%`,
        uspesnostCislo: parseFloat(uspesnost),
        celkoveHodinyFastingu: formatCisloSK(celkoveHodinyFastingu.toFixed(1)),
        priemernaDelkaFastingu: `${formatCisloSK(priemernaDelka)} hodín`,
        trendHmotnosti,
        pocetMeraniHmotnosti: hmotnosti.length,
        aktualnaHmotnost: hmotnosti.length > 0 ? formatCisloSK(hmotnosti[hmotnosti.length - 1].hmotnost) : null
      }
    });
  } catch (error) {
    console.error('Chyba pri výpočte štatistík:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri výpočte štatistík',
      details: error.message 
    });
  }
});

// GET /api/analytics/tyzdenne - Týždenný prehľad
app.get('/api/analytics/tyzdenne', async (req, res) => {
  try {
    const dnes = new Date();
    const zaciatokTyzdna = startOfWeek(dnes, { weekStartsOn: 1 });
    const koniecTyzdna = endOfWeek(dnes, { weekStartsOn: 1 });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    
    const tyzdennéZaznamy = rows.filter(row => {
      try {
        const datum = parseDatumSK(row[0]);
        return datum >= zaciatokTyzdna && datum <= koniecTyzdna;
      } catch {
        return false;
      }
    });

    let dokoncene = 0;
    let celkoveHodiny = 0;
    let pocetHodin = 0;
    
    tyzdennéZaznamy.forEach(row => {
      if (row[6] === 'Dokončený') {
        dokoncene++;
        const hodiny = parseCisloSK(row[5] || '0');
        if (!isNaN(hodiny)) {
          celkoveHodiny += hodiny;
          pocetHodin++;
        }
      }
    });

    const priemer = pocetHodin > 0 ? (celkoveHodiny / pocetHodin).toFixed(1) : 0;

    res.json({
      success: true,
      obdobie: `${formatDatumSK(zaciatokTyzdna)} - ${formatDatumSK(koniecTyzdna)}`,
      data: {
        celkemDni: tyzdennéZaznamy.length,
        dokoncentychDni: dokoncene,
        celkoveHodinyFastingu: formatCisloSK(celkoveHodiny.toFixed(1)),
        priemernaDelka: `${formatCisloSK(priemer)} hodín`,
        uspesnost: tyzdennéZaznamy.length > 0 
          ? `${((dokoncene / tyzdennéZaznamy.length) * 100).toFixed(0)}%` 
          : '0%'
      }
    });
  } catch (error) {
    console.error('Chyba pri výpočte týždenných štatistík:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri výpočte štatistík',
      details: error.message 
    });
  }
});

// GET /api/analytics/mesacne - Mesačný prehľad
app.get('/api/analytics/mesacne', async (req, res) => {
  try {
    const dnes = new Date();
    const zaciatokMesiaca = startOfMonth(dnes);
    const koniecMesiaca = endOfMonth(dnes);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    
    const mesacneZaznamy = rows.filter(row => {
      try {
        const datum = parseDatumSK(row[0]);
        return datum >= zaciatokMesiaca && datum <= koniecMesiaca;
      } catch {
        return false;
      }
    });

    let dokoncene = 0;
    let celkoveHodiny = 0;
    let pocetHodin = 0;
    let najdlhsiFasting = 0;
    let najdlhsiDen = '';
    
    mesacneZaznamy.forEach(row => {
      if (row[6] === 'Dokončený') {
        dokoncene++;
        const hodiny = parseCisloSK(row[5] || '0');
        if (!isNaN(hodiny)) {
          celkoveHodiny += hodiny;
          pocetHodin++;
          if (hodiny > najdlhsiFasting) {
            najdlhsiFasting = hodiny;
            najdlhsiDen = row[0];
          }
        }
      }
    });

    const priemer = pocetHodin > 0 ? (celkoveHodiny / pocetHodin).toFixed(1) : 0;

    res.json({
      success: true,
      obdobie: `${formatDatumSK(zaciatokMesiaca)} - ${formatDatumSK(koniecMesiaca)}`,
      data: {
        celkemDni: mesacneZaznamy.length,
        dokoncentychDni: dokoncene,
        celkoveHodinyFastingu: formatCisloSK(celkoveHodiny.toFixed(1)),
        priemernaDelka: `${formatCisloSK(priemer)} hodín`,
        uspesnost: mesacneZaznamy.length > 0 
          ? `${((dokoncene / mesacneZaznamy.length) * 100).toFixed(0)}%` 
          : '0%',
        najdlhsiFasting: formatCisloSK(najdlhsiFasting),
        najdlhsiDen: najdlhsiDen
      }
    });
  } catch (error) {
    console.error('Chyba pri výpočte mesačných štatistík:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri výpočte štatistík',
      details: error.message 
    });
  }
});

// GET /api/analytics/hmotnost - Trend hmotnosti
app.get('/api/analytics/hmotnost', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    
    const hmotnosti = rows
      .filter(row => row[7]) // Filter rows with weight
      .map(row => ({
        datum: row[0],
        hmotnost: parseCisloSK(row[7])
      }))
      .filter(item => !isNaN(item.hmotnost))
      .sort((a, b) => parseDatumSK(a.datum) - parseDatumSK(b.datum));

    if (hmotnosti.length === 0) {
      return res.json({
        success: true,
        data: {
          pocetMerani: 0,
          trend: 'Žiadne údaje',
          zmena: 0
        }
      });
    }

    const prvaHmotnost = hmotnosti[0].hmotnost;
    const poslednaHmotnost = hmotnosti[hmotnosti.length - 1].hmotnost;
    const zmena = poslednaHmotnost - prvaHmotnost;
    const zmenaPercent = ((zmena / prvaHmotnost) * 100).toFixed(1);

    let trend = 'Stabilný ➡️';
    if (zmena < -0.5) trend = 'Klesajúci 📉 (výborne!)';
    else if (zmena > 0.5) trend = 'Rastúci 📈';

    res.json({
      success: true,
      data: {
        pocetMerani: hmotnosti.length,
        prvaHmotnost: `${formatCisloSK(prvaHmotnost)} kg`,
        prveMeranie: hmotnosti[0].datum,
        aktualnaHmotnost: `${formatCisloSK(poslednaHmotnost)} kg`,
        posledneméranie: hmotnosti[hmotnosti.length - 1].datum,
        zmena: `${zmena > 0 ? '+' : ''}${formatCisloSK(zmena.toFixed(1))} kg`,
        zmenaPercent: `${zmenaPercent > 0 ? '+' : ''}${formatCisloSK(zmenaPercent)}%`,
        trend,
        historie: hmotnosti.map(h => ({
          datum: h.datum,
          hmotnost: formatCisloSK(h.hmotnost)
        }))
      }
    });
  } catch (error) {
    console.error('Chyba pri výpočte trendu hmotnosti:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri výpočte trendu hmotnosti',
      details: error.message 
    });
  }
});

// GET /api/dnes - Dnešný fasting plán
app.get('/api/dnes', async (req, res) => {
  try {
    const dnes = formatDatumSK(new Date());

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    const zaznam = rows.find(row => row[0] === dnes);

    if (!zaznam) {
      return res.json({
        success: true,
        data: {
          datum: dnes,
          existuje: false,
          message: `Pre dnes (${dnes}) nie je naplánovaný žiadny fasting.`
        }
      });
    }

    res.json({
      success: true,
      data: {
        existuje: true,
        datum: zaznam[0] || '',
        denVTyzdni: zaznam[1] || '',
        typFastingu: zaznam[2] || '',
        casZaciatku: zaznam[3] || '',
        casKonca: zaznam[4] || '',
        dlzkaFastingu: zaznam[5] || '',
        stav: zaznam[6] || '',
        hmotnost: zaznam[7] || '',
        energia: zaznam[8] || '',
        poznamka: zaznam[9] || ''
      }
    });
  } catch (error) {
    console.error('Chyba pri načítaní dnešného plánu:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri načítaní dnešného plánu',
      details: error.message 
    });
  }
});

// POST /api/oznac-den - Označ dnešný deň ako splnený/nesplnený
app.post('/api/oznac-den', [
  body('datum').matches(/^\d{2}\.\d{2}\.\d{4}$/).withMessage('Dátum musí byť vo formáte DD.MM.YYYY'),
  body('splnene').isBoolean().withMessage('splnene musí byť true alebo false'),
  body('hmotnost').optional().isString(),
  body('energia').optional().isString(),
  body('poznamka').optional().isString()
], validate, async (req, res) => {
  try {
    const { datum, splnene, hmotnost, energia, poznamka } = req.body;

    // Získaj existujúci záznam
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A2:J`,
    });

    const rows = response.data.values || [];
    const existingIndex = rows.findIndex(row => row[0] === datum);

    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Dátum ${datum} nebol nájdený v pláne.`
      });
    }

    const existingRow = rows[existingIndex];
    
    // Nastav stav podľa splnene
    const stav = splnene ? 'Dokončený' : 'Vynechaný';
    
    const updatedRow = [
      datum,
      existingRow[1],
      existingRow[2],
      existingRow[3],
      existingRow[4],
      existingRow[5],
      stav,
      hmotnost !== undefined ? hmotnost : existingRow[7] || '',
      energia !== undefined ? energia : existingRow[8] || '',
      poznamka !== undefined ? poznamka : existingRow[9] || ''
    ];

    // Aktualizuj riadok
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME_FASTING}!A${existingIndex + 2}:J${existingIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow]
      }
    });

    // Zmeň farbu: zelená ak splnené, červená ak nie
    await updateRowColor(existingIndex + 2, stav);

    res.json({
      success: true,
      message: splnene 
        ? `✅ Gratulujem! Deň ${datum} bol označený ako splnený (zelená)` 
        : `❌ Deň ${datum} bol označený ako nesplnený (červená)`,
      data: {
        datum: updatedRow[0],
        stav: updatedRow[6],
        splnene,
        farba: splnene ? 'zelená 🟢' : 'červená 🔴'
      }
    });
  } catch (error) {
    console.error('Chyba pri označovaní dňa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba pri označovaní dňa',
      details: error.message 
    });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Interná chyba servera',
    details: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint nebol nájdený' 
  });
});

// Spusť server
async function startServer() {
  try {
    initializeGoogleSheets();
    
    app.listen(PORT, () => {
      console.log(`🚀 Fasting Plan Manager API beží na porte ${PORT}`);
      console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}`);
      console.log(`🍽️ Hárok Fasting: ${SHEET_NAME_FASTING}`);
      console.log(`🍴 Hárok Jedlo: ${SHEET_NAME_JEDLO}`);
      console.log(`\n✅ Server je pripravený!`);
    });
  } catch (error) {
    console.error('❌ Chyba pri spustení servera:', error);
    process.exit(1);
  }
}

startServer();


