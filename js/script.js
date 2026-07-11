/**
 * script.js
 * =========
 * Portfolio v2 - Arch Linux Theme (Redesigned)
 *
 * Fitur:
 *   - Copyright year otomatis
 *   - Active menu highlight berdasarkan halaman aktif
 *   - Navbar blur effect saat di-scroll
 *   - Mobile hamburger menu
 *   - sessionStorage untuk Boot Screen (sekali per sesi)
 */

(function () {
    'use strict';

    // ========================================
    // COPYRIGHT YEAR
    // ========================================

    var tahunElement = document.getElementById('tahun-copyright');
    if (tahunElement) {
        tahunElement.textContent = new Date().getFullYear();
    }

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================

    var navbar = document.querySelector('.navbar');

    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ========================================
    // ACTIVE MENU HIGHLIGHT (Multi-page)
    // ========================================

    var navLinks = document.querySelectorAll('.nav-menu a, .nav-mobile a');

    function setActiveMenu() {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            link.classList.toggle('active', href === currentPage);
        });
    }

    // ========================================
    // MOBILE HAMBURGER MENU
    // ========================================

    var hamburger = document.querySelector('.nav-hamburger');
    var mobileMenu = document.querySelector('.nav-mobile');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Tutup menu saat link diklik
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });

        // Tutup menu saat klik di luar
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            }
        });
    }

    // ========================================
    // SESSION STORAGE - BOOT SCREEN
    // ========================================

    /**
     * Cek apakah boot screen sudah ditampilkan di sesi ini.
     * Jika sudah, sembunyikan boot screen dan tampilkan konten langsung.
     */
    function checkBootSession() {
        if (typeof sessionStorage === 'undefined') return;

        var bootShown = sessionStorage.getItem('portfolio_boot_shown');
        if (bootShown === 'true') {
            // Sembunyikan boot screen, tampilkan konten langsung
            document.body.classList.remove('boot-active');
            document.body.classList.remove('logo-active');

            // Pastikan elemen boot tersembunyi
            var bootScreen = document.getElementById('boot-screen');
            var logoScreen = document.getElementById('logo-screen');
            if (bootScreen) bootScreen.style.display = 'none';
            if (logoScreen) logoScreen.style.display = 'none';
        }
    }

    /**
     * Tandai bahwa boot screen sudah ditampilkan di sesi ini.
     */
    function markBootShown() {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('portfolio_boot_shown', 'true');
        }
    }

    // ========================================
    // SCROLL REVEAL ANIMATION
    // ========================================

    function initScrollReveal() {
        var revealElements = document.querySelectorAll('.section, .hero');

        if (!revealElements.length || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function (el) {
            el.classList.add('reveal-ready');
            observer.observe(el);
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    function onScroll() {
        handleNavbarScroll();
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('load', function () {
        handleNavbarScroll();
        setActiveMenu();
        initScrollReveal();
    });

    // Expose markBootShown globally agar boot.js bisa memanggil
    window.portfolioMarkBootShown = markBootShown;

    // Cek session saat load
    checkBootSession();

})();
