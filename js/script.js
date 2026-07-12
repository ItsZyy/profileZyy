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
    // SKILL CARDS - FLOAT PAUSE ON HOVER
    // ========================================

    function initSkillFloat() {
        var cards = document.querySelectorAll('.skill-card');
        if (!cards.length) return;

        cards.forEach(function (card) {
            card.addEventListener('mouseenter', function () {
                card.style.animationPlayState = 'paused';
            });
            card.addEventListener('mouseleave', function () {
                card.style.animationPlayState = 'running';
            });
        });
    }

    // ========================================
    // AI ASSISTANT PANEL (UI + Chat)
    // ========================================

    var aiToggle = document.getElementById('ai-toggle');
    var aiPanel = document.getElementById('ai-panel');
    var aiOverlay = document.getElementById('ai-overlay');
    var aiClose = document.getElementById('ai-close');
    var aiInput = document.getElementById('ai-input');
    var aiSend = document.getElementById('ai-send');
    var aiPanelBody = aiPanel ? aiPanel.querySelector('.ai-panel-body') : null;
    var aiChips = aiPanel ? aiPanel.querySelectorAll('.ai-chip') : [];

    function openAiPanel() {
        if (aiPanel) aiPanel.classList.add('active');
        if (aiOverlay) aiOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAiPanel() {
        if (aiPanel) aiPanel.classList.remove('active');
        if (aiOverlay) aiOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function scrollToBottom() {
        if (!aiPanelBody) return;
        aiPanelBody.scrollTo({
            top: aiPanelBody.scrollHeight,
            behavior: 'smooth'
        });
    }

    function addMessage(text, isUser) {
        if (!aiPanelBody) return;

        var msg = document.createElement('div');
        msg.className = 'ai-msg ' + (isUser ? 'ai-msg-user' : 'ai-msg-bot');
        msg.textContent = text;
        aiPanelBody.appendChild(msg);

        void msg.offsetWidth;
        msg.classList.add('ai-msg-visible');

        scrollToBottom();
    }

    function createTypingIndicator() {
        if (!aiPanelBody) return null;

        var wrapper = document.createElement('div');
        wrapper.className = 'ai-msg ai-msg-bot ai-msg-typing';

        var dots = document.createElement('span');
        dots.className = 'ai-typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';

        wrapper.appendChild(dots);
        aiPanelBody.appendChild(wrapper);
        scrollToBottom();

        return wrapper;
    }

    function removeTypingIndicator(el) {
        if (!el || !el.parentNode) return;
        el.parentNode.removeChild(el);
    }

    function updateSendButton() {
        if (!aiInput || !aiSend) return;
        var hasText = aiInput.value.trim().length > 0;
        aiSend.disabled = !hasText;
    }

    function handleSend() {
        if (!aiInput) return;
        var text = aiInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        aiInput.value = '';
        updateSendButton();
        aiInput.focus();

        var typing = createTypingIndicator();

        setTimeout(function () {
            var response = PortfolioAI.generateResponse(text);
            removeTypingIndicator(typing);
            addMessage(response, false);
        }, 600);
    }

    function handleChip(e) {
        var text = e.target.textContent;
        if (!text) return;

        addMessage(text, true);

        var typing = createTypingIndicator();

        setTimeout(function () {
            var response = PortfolioAI.generateResponse(text);
            removeTypingIndicator(typing);
            addMessage(response, false);
        }, 600);
    }

    if (aiToggle) aiToggle.addEventListener('click', openAiPanel);
    if (aiClose) aiClose.addEventListener('click', closeAiPanel);
    if (aiOverlay) aiOverlay.addEventListener('click', closeAiPanel);
    if (aiSend) aiSend.addEventListener('click', handleSend);

    if (aiInput) {
        aiInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        aiInput.addEventListener('input', updateSendButton);
        updateSendButton();
    }

    aiChips.forEach(function (chip) {
        chip.addEventListener('click', handleChip);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAiPanel();
    });

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
        initSkillFloat();
    });

    // Expose markBootShown globally agar boot.js bisa memanggil
    window.portfolioMarkBootShown = markBootShown;

    // Cek session saat load
    checkBootSession();

})();
