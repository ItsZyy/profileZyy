/**
 * boot.js
 * =========
 * Mengatur logika Boot Screen systemd-style untuk portfolio v2 (Arch Linux theme).
 *
 * Fitur:
 *   - Header informasi sistem (ZyyArch Linux, host, session)
 *   - Boot timer yang terus bertambah selama proses boot
 *   - Efek typing (karakter muncul satu per satu) untuk setiap baris
 *   - Status [  OK  ] hijau setelah proses berhasil
 *   - Variasi durasi antar baris agar terasa natural
 *   - Progress bar terisi seiring kemajuan boot
 *   - Setelah "System ready." -> fade out -> Logo Splash Screen
 */

(function () {
    'use strict';

    // ========================================
    // KONFIGURASI
    // ========================================

    /** Header informasi sistem */
    var SYSTEM_INFO = {
        title: 'ZyyArch Linux (tty1)',
        host: 'zyymikbll_',
        session: 'Portfolio'
    };

    /**
     * Daftar langkah boot.
     * Setiap objek memiliki:
     *   - text     {string}  Teks pesan boot
     *   - delay    {number}  Jeda (ms) setelah typing selesai sebelum lanjut
     *   - typing   {number}  Kecepatan typing (ms per karakter)
     *   - ok       {string}  Teks status [  OK  ] (opsional, jika ada = tampilkan OK)
     *   - final    {boolean} Jika true, baris ini adalah baris terakhir
     */
    var BOOT_STEPS = [
        { text: 'Starting boot sequence...',           delay: 400,  typing: 18 },
        { text: 'Loading Linux kernel...',              delay: 200,  typing: 16, ok: 'Kernel loaded.' },
        { text: 'Initializing hardware...',             delay: 180,  typing: 16, ok: 'Hardware initialized.' },
        { text: 'Mounting filesystems...',              delay: 220,  typing: 16, ok: 'Filesystems mounted.' },
        { text: 'Starting journald...',                 delay: 150,  typing: 16, ok: 'Started Journal Service.' },
        { text: 'Starting NetworkManager...',           delay: 350,  typing: 16, ok: 'Started Network Manager.' },
        { text: 'Starting display manager...',          delay: 300,  typing: 16, ok: 'Started Display Manager.' },
        { text: 'Starting user session...',             delay: 200,  typing: 16, ok: 'User session started.' },
        { text: 'System ready.',                        delay: 600,  typing: 22, final: true }
    ];

    /** Jeda (ms) sebelum boot sequence dimulai */
    var INITIAL_DELAY = 500;

    /** Interval (ms) update boot timer */
    var TIMER_INTERVAL = 100;

    // ========================================
    // ELEMEN DOM
    // ========================================

    var bootHeader = document.getElementById('boot-header');
    var bootText = document.getElementById('boot-text');
    var bootTimer = document.getElementById('boot-timer');
    var progressBar = document.getElementById('boot-progress-bar');

    // ========================================
    // STATE
    // ========================================

    var timerStartTime = 0;
    var timerIntervalId = null;
    var isBootDone = false;

    // ========================================
    // FUNGSI: HEADER INFORMASI SISTEM
    // ========================================

    /**
     * Mengisi area boot-header dengan informasi sistem.
     * Ditampilkan secara instan tanpa typing effect.
     */
    function renderHeader() {
        if (!bootHeader) return;

        var html = '';

        // Judul: Arch Linux (dengan accent biru)
        html += '<div class="boot-header-title">' + SYSTEM_INFO.title + '</div>';

        // Baris kosong sebagai pemisah
        html += '<div>&nbsp;</div>';

        // Host
        html += '<div><span class="boot-header-label">Host: </span>';
        html += '<span class="boot-header-value">' + SYSTEM_INFO.host + '</span></div>';

        // Session
        html += '<div><span class="boot-header-label">Session: </span>';
        html += '<span class="boot-header-value accent">' + SYSTEM_INFO.session + '</span></div>';

        bootHeader.innerHTML = html;
    }

    // ========================================
    // FUNGSI: BOOT TIMER
    // ========================================

    /**
     * Memulai boot timer yang terus bertambah.
     * Format: [    0.000] (4 digit sebelum desimal, 3 sesudah)
     */
    function startTimer() {
        timerStartTime = Date.now();

        timerIntervalId = setInterval(function () {
            if (isBootDone) return;

            var elapsed = (Date.now() - timerStartTime) / 1000;
            var formatted = formatTimestamp(elapsed);

            if (bootTimer) {
                bootTimer.textContent = formatted;
            }
        }, TIMER_INTERVAL);
    }

    /**
     * Menghentikan boot timer.
     */
    function stopTimer() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
        if (bootTimer) {
            bootTimer.textContent = '[   10.000]';
            bootTimer.classList.add('boot-timer-done');
        }
    }

    /**
     * Memformat waktu ke format timestamp boot Linux.
     * Contoh: 1.234 -> "[    1.234]"
     * @param {number} seconds - Waktu dalam detik.
     * @returns {string} String terformat.
     */
    function formatTimestamp(seconds) {
        var intPart = Math.floor(seconds);
        var decPart = Math.round((seconds - intPart) * 1000);

        // Pad integer dengan spasi di kiri (4 digit total)
        var intStr = String(intPart);
        while (intStr.length < 4) {
            intStr = ' ' + intStr;
        }

        // Pad desimal dengan 0 di kiri (3 digit total)
        var decStr = String(decPart);
        while (decStr.length < 3) {
            decStr = '0' + decStr;
        }

        return '[' + intStr + '.' + decStr + ']';
    }

    // ========================================
    // FUNGSI: PROGRESS BAR
    // ========================================

    /**
     * Memperbarui lebar progress bar.
     * @param {number} percent - Persentase (0 - 100).
     */
    function updateProgress(percent) {
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }

    // ========================================
    // FUNGSI: SCROLL OTOMATIS
    // ========================================

    /**
     * Menggulir area teks ke bawah agar baris terbaru terlihat.
     */
    function scrollToBottom() {
        if (bootText) {
            bootText.scrollTop = bootText.scrollHeight;
        }
    }

    // ========================================
    // FUNGSI: TYPING EFFECT
    // ========================================

    /**
     * Menampilkan teks dengan efek typing (karakter per karakter).
     * @param {HTMLElement} container - Elemen yang akan diisi teks.
     * @param {string} text - Teks yang akan ditampilkan.
     * @param {number} speed - Jeda (ms) antar karakter.
     * @returns {Promise} Resolve setelah semua karakter ditampilkan.
     */
    function typeText(container, text, speed) {
        return new Promise(function (resolve) {
            var index = 0;

            function typeNext() {
                if (index >= text.length) {
                    resolve();
                    return;
                }

                container.textContent += text.charAt(index);
                index++;
                scrollToBottom();

                setTimeout(typeNext, speed);
            }

            typeNext();
        });
    }

    // ========================================
    // FUNGSI: STATUS INDICATOR
    // ========================================

    /**
     * Membuat elemen status [  OK  ].
     * @param {string} okText - Teks setelah status OK.
     * @returns {HTMLElement} Elemen span berisi status OK.
     */
    function createOkStatus(okText) {
        var span = document.createElement('span');
        span.className = 'boot-status-ok';
        span.textContent = ' [  OK  ] ' + okText;
        return span;
    }

    /**
     * Membuat elemen loading [....] sementara.
     * @returns {HTMLElement} Elemen span berisi loading indicator.
     */
    function createLoadingDots() {
        var span = document.createElement('span');
        span.className = 'boot-status-loading';
        span.textContent = ' [....]';
        return span;
    }

    // ========================================
    // FUNGSI: KURSOR
    // ========================================

    /**
     * Membuat elemen kursor berkedip.
     * @returns {HTMLElement}
     */
    function createCursor() {
        var cursor = document.createElement('span');
        cursor.className = 'boot-cursor';
        cursor.id = 'boot-cursor';
        return cursor;
    }

    /**
     * Menyembunyikan kursor yang sedang aktif.
     */
    function hideActiveCursor() {
        var old = document.getElementById('boot-cursor');
        if (old) {
            old.classList.add('boot-cursor-hidden');
        }
    }

    // ========================================
    // FUNGSI: KONSTRUKSI BARIS BOOT
    // ========================================

    /**
     * Membuat elemen baris boot dengan timestamp dan area pesan.
     * @param {string} timestamp - Timestamp format [    0.000]
     * @returns {Object} { line, messageSpan }
     */
    function createBootLine(timestamp) {
        var line = document.createElement('div');
        line.className = 'boot-line';

        // Timestamp
        var tsSpan = document.createElement('span');
        tsSpan.className = 'boot-timestamp';
        tsSpan.textContent = timestamp + ' ';
        line.appendChild(tsSpan);

        // Area untuk pesan (akan diisi oleh typing effect)
        var messageSpan = document.createElement('span');
        messageSpan.className = 'boot-message';
        line.appendChild(messageSpan);

        return { line: line, messageSpan: messageSpan };
    }

    // ========================================
    // LOGIKA UTAMA: BOOT SEQUENCE
    // ========================================

    /**
     * Menjalankan seluruh urutan booting.
     * Setiap langkah:
     *   1. Sembunyikan kursor sebelumnya
     *   2. Buat baris baru dengan timestamp
     *   3. Type pesan dengan efek typing
     *   4. Tampilkan loading dots [....]
     *   5. Ganti dengan status [  OK  ] + teks OK
     *   6. Tunggu delay lalu lanjut ke langkah berikutnya
     */
    function runBootSequence() {
        var totalSteps = BOOT_STEPS.length;
        var currentStep = 0;

        function processStep() {
            return new Promise(function (resolve) {
                if (currentStep >= totalSteps) {
                    resolve();
                    return;
                }

                var step = BOOT_STEPS[currentStep];
                var isFinal = step.final === true;
                var progressPercent = ((currentStep + 1) / totalSteps) * 100;

                // Sembunyikan kursor aktif
                hideActiveCursor();

                // Dapatkan timestamp dari timer
                var elapsed = (Date.now() - timerStartTime) / 1000;
                var timestamp = formatTimestamp(elapsed);

                // Buat baris boot baru
                var result = createBootLine(timestamp);
                var line = result.line;
                var messageSpan = result.messageSpan;

                // Tambahkan kursor di akhir baris
                var cursor = createCursor();
                line.appendChild(cursor);

                // Sisipkan baris ke area teks
                bootText.appendChild(line);
                scrollToBottom();

                // Mulai typing effect
                typeText(messageSpan, step.text, step.typing).then(function () {
                    // Setelah typing selesai, proses status
                    if (isFinal) {
                        // Baris terakhir: sembunyikan kursor, warnai hijau
                        hideActiveCursor();
                        line.classList.add('boot-ready');
                        messageSpan.classList.remove('boot-message');
                        messageSpan.classList.add('boot-ready');

                        // Hentikan timer
                        stopTimer();
                        isBootDone = true;

                        // Perbarui progress ke 100%
                        updateProgress(100);

                        // Tunggu sebentar lalu resolve, lalu transisi ke logo
                        setTimeout(function () {
                            resolve();
                            // Setelah step terakhir selesai, transisi ke logo screen
                            setTimeout(transitionToLogoScreen, 200);
                        }, step.delay);
                    } else if (step.ok) {
                        // Ada status OK: tampilkan loading dots dulu
                        var dots = createLoadingDots();
                        line.appendChild(dots);
                        scrollToBottom();

                        // Setelah jeda singkat, ganti dengan OK
                        setTimeout(function () {
                            // Sembunyikan loading dots
                            dots.style.display = 'none';

                            // Tampilkan status OK
                            var okStatus = createOkStatus(step.ok);
                            line.appendChild(okStatus);
                            scrollToBottom();

                            // Tunggu delay lalu lanjut
                            setTimeout(resolve, step.delay);
                        }, 120);
                    } else {
                        // Tanpa status OK: langsung lanjut
                        hideActiveCursor();
                        setTimeout(resolve, step.delay);
                    }
                });

                currentStep++;
            });
        }

        // Bangun rantai promise
        var chain = Promise.resolve();
        for (var i = 0; i < totalSteps; i++) {
            chain = chain.then(processStep);
        }

        return chain;
    }

    // ========================================
    // FUNGSI: TRANSISI KE LOGO SCREEN
    // ========================================

    /**
     * Melakukan fade out Boot Screen lalu menampilkan Logo Screen.
     * Dipanggil setelah boot sequence selesai.
     */
    function transitionToLogoScreen() {
        // Tambahkan class untuk fade out boot screen
        document.body.classList.add('boot-fade');

        // Setelah fade out selesai (800ms), tampilkan logo screen
        setTimeout(function () {
            // Sembunyikan boot screen
            document.body.classList.remove('boot-active');

            // Tampilkan logo screen
            document.body.classList.add('logo-active');
        }, 800);
    }

    // ========================================
    // INISIALISASI
    // ========================================

    function init() {
        // Tambahkan class ke body untuk menampilkan boot screen
        document.body.classList.add('boot-active');

        // Render header informasi sistem
        renderHeader();

        // Mulai urutan boot setelah jeda awal
        setTimeout(function () {
            // Mulai timer
            startTimer();

            // Jalankan boot sequence
            runBootSequence();
        }, INITIAL_DELAY);
    }

    // Jalankan saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
