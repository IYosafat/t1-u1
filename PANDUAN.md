# 📖 Panduan Lengkap — Undangan Pernikahan Digital

## 📁 Struktur File

```
undangan-pernikahan/
├── index.html     ← Halaman utama website
├── style.css      ← Semua tampilan/styling
├── script.js      ← Logika JavaScript
├── Code.gs        ← Kode Google Apps Script
├── PANDUAN.md     ← File ini
└── musik.mp3      ← (Opsional) Lagu background
```

---

## 🎨 Cara Kustomisasi Website

Semua yang perlu diubah sudah ditandai dengan komentar `<!-- ↓ Ganti ... ↓ -->` di `index.html` dan `CONFIG` di `script.js`.

### 1. Ganti Nama Pengantin
Di `index.html`, cari dan ganti:
```html
<span class="name-bride">Bunga Citra</span>
<span class="name-groom">Andi Pratama</span>
```

### 2. Ganti Foto Hero (Background)
Di `index.html`, ganti URL foto pada atribut `style`:
```html
<div class="hero-bg" style="background-image: url('URL_FOTO_ANDA');"></div>
```
Tips: Upload foto ke Google Drive, Cloudinary, atau ImgBB untuk mendapat URL publik.

### 3. Ganti Foto Galeri (3 foto)
Di `index.html`, ganti `src` pada tiga tag `<img>` di bagian galeri:
```html
<img src="URL_FOTO_1" alt="Foto pengantin 1"/>
<img src="URL_FOTO_2" alt="Foto pengantin 2"/>
<img src="URL_FOTO_3" alt="Foto pengantin 3"/>
```

### 4. Ganti Tanggal & Waktu Acara
Di `index.html`: ganti teks di section detail acara dan countdown.
Di `script.js`, ubah nilai `weddingDate`:
```javascript
weddingDate: '2026-02-14T08:00:00',
// Format: TAHUN-BULAN-TANGGALTJAM:MENIT:DETIK
```

### 5. Ganti Peta Lokasi
1. Buka [maps.google.com](https://maps.google.com)
2. Cari lokasi venue → klik **Bagikan** → **Sematkan Peta**
3. Salin kode `<iframe ...>` dan tempel di `index.html` (bagian maps)

### 6. Ganti Nomor Rekening / E-Wallet
Di `index.html`, ubah teks di dalam `.gift-number` dan `.gift-name`.

### 7. Tambah Musik Background
- Letakkan file `musik.mp3` di folder yang sama dengan `index.html`
- Atau ganti `src` di tag `<audio>` dengan URL lagu online

---

## 🔗 Setup Google Sheets (Integrasi Database)

### Langkah 1: Buat Google Spreadsheet
1. Buka [sheets.google.com](https://sheets.google.com)
2. Klik **"+ Blank"** untuk spreadsheet baru
3. Beri nama, misal: **"Database Undangan Pernikahan"**
4. Salin ID dari URL:
   - URL: `https://docs.google.com/spreadsheets/d/`**`ABC123xyz`**`/edit`
   - ID Spreadsheet Anda adalah: **`ABC123xyz`**

### Langkah 2: Buat Google Apps Script
1. Di Spreadsheet, klik menu **Ekstensi → Apps Script**
2. Hapus semua kode default di editor
3. Salin seluruh isi file **`Code.gs`** dan tempel di sini
4. Ganti `GANTI_DENGAN_SPREADSHEET_ID_ANDA` dengan ID di Langkah 1:
   ```javascript
   const SPREADSHEET_ID = 'ABC123xyz'; // ID Spreadsheet Anda
   ```
5. Klik **Simpan** (ikon disket atau Ctrl+S)

### Langkah 3: Jalankan Setup Awal
1. Di editor Apps Script, pilih fungsi **`setupSheets`** dari dropdown
2. Klik tombol **▶ Jalankan**
3. Izinkan akses saat diminta (klik **Tinjau izin → Izinkan**)
4. Akan muncul alert: *"✅ Setup selesai!"*
5. Kembali ke Spreadsheet — akan ada 2 sheet baru: **Ucapan** dan **Tamu**

### Langkah 4: Deploy sebagai Web App
1. Di editor Apps Script, klik **Deploy → New deployment**
2. Klik ikon ⚙️ di samping "Select type" → pilih **Web App**
3. Isi konfigurasi:
   - **Description**: Undangan Pernikahan API
   - **Execute as**: **Me** (akun Google Anda)
   - **Who has access**: **Anyone** ← *penting agar website bisa mengakses*
4. Klik **Deploy**
5. Salin **URL Web App** yang muncul (format: `https://script.google.com/macros/s/xxxxx/exec`)

### Langkah 5: Sambungkan ke Website
1. Buka `script.js`
2. Ganti nilai `sheetsWebAppUrl` dengan URL dari Langkah 4:
   ```javascript
   sheetsWebAppUrl: 'https://script.google.com/macros/s/URL_ANDA/exec',
   ```
3. Aktifkan integrasi:
   ```javascript
   useSheetsIntegration: true,
   ```

### Langkah 6: Deploy Ulang Saat Ada Perubahan Code.gs
> ⚠️ Setiap kali Anda mengedit `Code.gs`, wajib deploy ulang:
> **Deploy → Manage deployments → Edit (ikon pensil) → Version: New version → Deploy**

---

## 👥 Mengelola Daftar Tamu Undangan

Di sheet **"Tamu"** di Google Spreadsheet Anda:
- Kolom A: **Nama Tamu** (wajib, untuk validasi)
- Kolom B: Nomor HP
- Kolom C: Keterangan (keluarga, teman, rekan kerja, dll)

Isi data tamu secara manual di sheet ini. Anda bisa memvalidasi tamu dari JavaScript dengan memanggil:
```javascript
// Contoh: cek apakah "Budi Santoso" ada di daftar tamu
fetch(CONFIG.sheetsWebAppUrl + '?action=checkGuest&name=Budi%20Santoso')
  .then(r => r.json())
  .then(data => console.log(data.found)); // true / false
```

---

## 📊 Melihat Data Ucapan

Data ucapan yang masuk bisa dilihat langsung di sheet **"Ucapan"** di Google Spreadsheet Anda secara real-time, dengan kolom:
| Timestamp | Nama | Kehadiran | Pesan/Doa |
|-----------|------|-----------|-----------|
| 14/2/2026 08:30 | Budi Santoso | Hadir | Selamat ya! |

---

## 🌐 Cara Publish Website

### Opsi A: GitHub Pages (Gratis)
1. Buat akun di [github.com](https://github.com)
2. Buat repository baru (misal: `undangan-bunga-andi`)
3. Upload semua file (`index.html`, `style.css`, `script.js`)
4. Masuk ke **Settings → Pages → Source: main branch**
5. Website live di: `https://username.github.io/undangan-bunga-andi`

### Opsi B: Netlify (Gratis, Mudah)
1. Buka [netlify.com](https://netlify.com) → Sign Up
2. Drag & drop folder website ke area deploy
3. Website langsung live dengan URL random (bisa dikustomisasi)

### Opsi C: Hosting Lokal untuk Testing
1. Install **VS Code** + ekstensi **Live Server**
2. Klik kanan `index.html` → **Open with Live Server**

---

## 🔒 Catatan Keamanan

- **Google Apps Script** dengan akses "Anyone" berarti siapapun bisa POST data ke endpoint Anda. Ini cukup aman untuk undangan pernikahan.
- Untuk keamanan tambahan, Anda bisa menambahkan validasi token di `Code.gs`.
- Jangan bagikan **SPREADSHEET_ID** secara publik.

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Ucapan tidak tersimpan di Sheets | Pastikan `useSheetsIntegration: true` dan URL web app sudah benar |
| CORS error di browser | Pastikan Apps Script di-deploy dengan "Anyone" access |
| Musik tidak berputar | Browser memblokir autoplay — klik tombol musik secara manual |
| Peta tidak muncul | Ganti iframe peta dengan link venue yang benar |
| Countdown sudah selesai | Ubah `weddingDate` ke tanggal mendatang untuk testing |

---

*Dibuat dengan ❤️ — Selamat menempuh hidup baru!*
