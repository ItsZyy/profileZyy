/**
 * email-config.js
 * ===============
 * Konfigurasi EmailJS untuk form kontak.
 *
 * Ganti nilai kosong dengan kredensial EmailJS Anda:
 *   1. Daftar di https://www.emailjs.com/
 *   2. Buat Email Service (dapatkan Service ID)
 *   3. Buat Email Template (dapatkan Template ID)
 *   4. Salin Public Key dari Account > API Keys
 *
 * Template email harus berisi variabel berikut:
 *   {{from_name}}  - Nama pengirim
 *   {{from_email}} - Email pengirim
 *   {{subject}}    - Subjek pesan
 *   {{message}}    - Isi pesan
 */

var EMAIL_CONFIG = {
    publicKey: "",
    serviceId: "",
    templateId: ""
};
