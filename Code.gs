/**
 * =====================================================
 * Code.gs — Google Apps Script
 * Undangan Pernikahan × Google Sheets Integration
 *
 * Fungsi:
 *   1. Menerima POST dari form "Ucapan & Doa"
 *      dan menyimpan ke Sheet "Ucapan"
 *   2. Menerima GET request untuk mengambil daftar ucapan
 *   3. (Opsional) Validasi daftar tamu undangan dari Sheet "Tamu"
 *
 * CARA DEPLOY:
 *   Lihat PANDUAN.md untuk langkah lengkap.
 * =====================================================
 */

// ── ID Spreadsheet Anda (ambil dari URL Google Sheets) ──
// URL contoh: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
// ↓ Ganti SPREADSHEET_ID di bawah ini ↓
const SPREADSHEET_ID = 'GANTI_DENGAN_SPREADSHEET_ID_ANDA';

// Nama sheet (tab) di dalam Spreadsheet
const SHEET_UCAPAN = 'Ucapan';
const SHEET_TAMU   = 'Tamu';


/* =====================================================
   doPost — Handle form ucapan
   ===================================================== */
function doPost(e) {
  try {
    const ss      = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet   = getOrCreateSheet(ss, SHEET_UCAPAN);

    // Parse body JSON dari request
    const body = JSON.parse(e.postData.contents);

    const name       = body.name       || '';
    const attendance = body.attendance || '';
    const message    = body.message    || '';
    const timestamp  = body.timestamp  || new Date().toLocaleString('id-ID');

    // Tambahkan header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Pesan/Doa']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#F2D7D5');
    }

    // Simpan data ucapan
    sheet.appendRow([timestamp, name, attendance, message]);

    // Auto-resize kolom agar rapi
    sheet.autoResizeColumns(1, 4);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Ucapan tersimpan!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/* =====================================================
   doGet — Ambil daftar ucapan & validasi tamu
   ===================================================== */
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    const ss     = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ── GET: daftar ucapan ──
    if (action === 'getWishes') {
      const sheet = ss.getSheetByName(SHEET_UCAPAN);
      if (!sheet || sheet.getLastRow() <= 1) {
        return jsonResponse({ status: 'ok', wishes: [] });
      }

      // Ambil semua data mulai baris 2 (lewati header)
      const data  = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
      const wishes = data
        .filter(row => row[1]) // hanya baris yang ada namanya
        .map(row => ({
          timestamp:  row[0],
          name:       row[1],
          attendance: row[2],
          message:    row[3],
        }));

      return jsonResponse({ status: 'ok', wishes });
    }

    // ── GET: validasi tamu undangan ──
    if (action === 'checkGuest') {
      const guestName = (e.parameter.name || '').toLowerCase().trim();
      const sheet     = ss.getSheetByName(SHEET_TAMU);

      if (!sheet || !guestName) {
        return jsonResponse({ status: 'error', found: false, message: 'Nama tidak ditemukan.' });
      }

      // Ambil kolom A (Nama Tamu) dari sheet Tamu
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return jsonResponse({ status: 'ok', found: false });

      const names = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      const found = names.some(n => n.toString().toLowerCase().trim() === guestName);

      return jsonResponse({ status: 'ok', found, message: found ? 'Tamu ditemukan!' : 'Nama tidak ada di daftar tamu.' });
    }

    // Default response
    return jsonResponse({ status: 'ok', message: 'Wedding Invitation API berjalan.' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}


/* =====================================================
   HELPER FUNCTIONS
   ===================================================== */

/** Buat atau ambil sheet dengan nama tertentu */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/** Buat JSON response dengan header CORS */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/* =====================================================
   SETUP AWAL — Jalankan sekali untuk membuat struktur Sheet
   Buka menu: Ekstensi > Apps Script > Jalankan fungsi setupSheets()
   ===================================================== */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Sheet Ucapan
  const ucapanSheet = getOrCreateSheet(ss, SHEET_UCAPAN);
  if (ucapanSheet.getLastRow() === 0) {
    ucapanSheet.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Pesan/Doa']);
    ucapanSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#F2D7D5');
    ucapanSheet.setColumnWidth(1, 180);
    ucapanSheet.setColumnWidth(2, 200);
    ucapanSheet.setColumnWidth(3, 120);
    ucapanSheet.setColumnWidth(4, 400);
  }

  // Sheet Tamu Undangan
  const tamuSheet = getOrCreateSheet(ss, SHEET_TAMU);
  if (tamuSheet.getLastRow() === 0) {
    tamuSheet.appendRow(['Nama Tamu', 'Nomor HP', 'Keterangan']);
    tamuSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#A8B5A2');
    tamuSheet.setColumnWidth(1, 250);
    tamuSheet.setColumnWidth(2, 150);
    tamuSheet.setColumnWidth(3, 200);

    // Contoh data tamu
    tamuSheet.appendRow(['Budi Santoso', '081234567890', 'Keluarga']);
    tamuSheet.appendRow(['Sari Dewi', '089876543210', 'Teman kantor']);
  }

  SpreadsheetApp.getUi().alert('✅ Setup selesai! Sheet "Ucapan" dan "Tamu" telah dibuat.');
}
