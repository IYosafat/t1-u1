/* =====================================================
   WEDDING INVITATION — SCRIPT.JS
   Fitur: Countdown · Copy Rekening · Form Ucapan
          Google Sheets Integration · Musik · Toast
   ===================================================== */

/* ──────────────────────────────────────────────────────
   ↓ KONFIGURASI UTAMA — GANTI NILAI DI SINI ↓
   ────────────────────────────────────────────────────── */
const CONFIG = {
  // Tanggal & waktu hari H (format ISO 8601)
  // Contoh: '2026-02-14T08:00:00'
  weddingDate: '2026-02-14T08:00:00',

  // URL Google Apps Script Web App Anda
  // (Lihat panduan di file Code.gs & PANDUAN.md)
  // Ganti dengan URL yang Anda dapat setelah deploy Web App
  sheetsWebAppUrl: 'https://script.google.com/macros/s/GANTI_DENGAN_URL_WEB_APP_ANDA/exec',

  // Aktifkan/nonaktifkan integrasi Google Sheets
  // Set ke false jika belum setup (ucapan hanya tersimpan lokal)
  useSheetsIntegration: false,
};
/* ────────────────────────────────────────────────────── */


/* =====================================================
   1. COUNTDOWN TIMER
   ===================================================== */
function updateCountdown() {
  const target  = new Date(CONFIG.weddingDate).2027-02-14T08:00:00();
  const now     = Date.now();
  const diff    = target - now;

  const cdEl    = document.getElementById('countdown');
  const doneEl  = document.getElementById('countdown-done');

  if (diff <= 0) {
    // Hari H sudah tiba!
    if (cdEl)   cdEl.style.display   = 'none';
    if (doneEl) doneEl.style.display = 'block';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n) => String(n).padStart(2, '0');

  document.getElementById('cd-days').textContent    = pad(days);
  document.getElementById('cd-hours').textContent   = pad(hours);
  document.getElementById('cd-minutes').textContent = pad(minutes);
  document.getElementById('cd-seconds').textContent = pad(seconds);
}

// Jalankan setiap detik
updateCountdown();
setInterval(updateCountdown, 1000);


/* =====================================================
   2. SALIN NOMOR REKENING (Copy to Clipboard)
   ===================================================== */
function copyRek(elementId, btn) {
  const text = document.getElementById(elementId).textContent.trim();

  navigator.clipboard.writeText(text)
    .then(() => {
      // Visual feedback pada tombol
      const originalText = btn.innerHTML;
      btn.innerHTML      = '✅ Tersalin!';
      btn.classList.add('copied');
      btn.disabled = true;

      showToast('Nomor berhasil disalin! 📋');

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
        btn.disabled = false;
      }, 2500);
    })
    .catch(() => {
      // Fallback untuk browser lama
      const ta       = document.createElement('textarea');
      ta.value       = text;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Nomor berhasil disalin! 📋');
      } catch (e) {
        showToast('Salin manual: ' + text);
      }
      document.body.removeChild(ta);
    });
}


/* =====================================================
   3. TOAST NOTIFICATION
   ===================================================== */
let toastTimer;
function showToast(message) {
  const toast   = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* =====================================================
   4. FORM UCAPAN & DOA + GOOGLE SHEETS
   ===================================================== */

/**
 * Kirim data ke Google Sheets via Web App (background, no-cors)
 */
async function sendToSheets(data) {
  await fetch(CONFIG.sheetsWebAppUrl, {
    method:  'POST',
    mode:    'no-cors', // Google Apps Script memerlukan no-cors
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  // Dengan mode no-cors, respons selalu opaque — data tetap terkirim ke Sheets.
  return true;
}

/**
 * Handle submit form ucapan
 */
async function submitWish() {
  const nameEl    = document.getElementById('guestName');
  const attendEl  = document.getElementById('attendance');
  const msgEl     = document.getElementById('wishMessage');
  const statusEl  = document.getElementById('form-status');
  const submitBtn = document.getElementById('submitWish');

  const name       = nameEl.value.trim();
  const attendance = attendEl.value;
  const message    = msgEl.value.trim();

  // Validasi
  if (!name) {
    statusEl.className   = 'form-status error';
    statusEl.textContent = '⚠️ Mohon isi nama lengkap Anda.';
    nameEl.focus();
    return;
  }
  if (!attendance) {
    statusEl.className   = 'form-status error';
    statusEl.textContent = '⚠️ Mohon pilih konfirmasi kehadiran.';
    attendEl.focus();
    return;
  }
  if (!message) {
    statusEl.className   = 'form-status error';
    statusEl.textContent = '⚠️ Mohon tulis pesan untuk pengantin.';
    msgEl.focus();
    return;
  }

  // Loading state
  submitBtn.disabled    = true;
  submitBtn.textContent = '⏳ Mengirim…';
  statusEl.className    = 'form-status';
  statusEl.textContent  = '';

  const wishData = {
    name,
    attendance,
    message,
    timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
  };

  try {
    // Kirim ke Google Sheets (background)
    if (CONFIG.useSheetsIntegration) {
      await sendToSheets(wishData);
    }

    // Reset form
    nameEl.value   = '';
    attendEl.value = '';
    msgEl.value    = '';

    // Tampilkan pesan sukses — tanpa reload halaman
    statusEl.className   = 'form-status';
    statusEl.textContent = '✅ Terima kasih, pesan Anda telah tersimpan! 🌸';
    showToast('Pesan berhasil dikirim! 💌');

  } catch (err) {
    statusEl.className   = 'form-status error';
    statusEl.textContent = '❌ Gagal mengirim. Silakan coba lagi.';
    console.error('Submit error:', err);
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = '💌 Kirim Ucapan';
    // Hapus pesan status setelah 6 detik
    setTimeout(() => { statusEl.textContent = ''; }, 6000);
  }
}

// Izinkan submit dengan Ctrl+Enter di textarea
document.addEventListener('DOMContentLoaded', () => {
  const msgEl = document.getElementById('wishMessage');
  if (msgEl) {
    msgEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        submitWish();
      }
    });
  }
});

/**
 * Escape HTML untuk mencegah XSS
 */
function escapeHtml(str) {
  const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
  return String(str).replace(/[&<>"']/g, (m) => map[m]);
}


/* =====================================================
   5. MUSIK BACKGROUND
   ===================================================== */
const musicBtn  = document.getElementById('musicBtn');
const bgMusic   = document.getElementById('bgMusic');
const musicIcon = document.getElementById('musicIcon');
let   isPlaying = false;

if (musicBtn && bgMusic) {
  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      musicIcon.textContent = '♪';
      musicBtn.title = 'Putar Musik';
    } else {
      bgMusic.play().catch(() => {
        // Browser memblokir autoplay sebelum interaksi user
        showToast('Klik lagi untuk memutar musik 🎵');
      });
      musicIcon.textContent = '⏸';
      musicBtn.title = 'Jeda Musik';
    }
    isPlaying = !isPlaying;
  });
}


/* =====================================================
   6. SCROLL REVEAL RINGAN (tanpa library)
   ===================================================== */
const revealEls = document.querySelectorAll('.event-card, .gallery-item, .gift-card, .wish-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach((el) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(el);
});
