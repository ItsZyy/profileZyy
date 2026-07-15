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
    var aiPanelBody = document.getElementById('ai-panel-body');

    var aiOpened = false;
    var aiReady = false;

    PortfolioAI.waitForReady().then(function (ok) {
        aiReady = ok;
        if (ok) {
            console.log('[AI Panel] Knowledge base is ready.');
        } else {
            console.warn('[AI Panel] Knowledge base failed to load.');
        }
    });

    var WELCOME_TEXT = 'Halo! Saya adalah AI Assistant Ezy Muhammad Ikbal, yang dapat membantu anda mengenali bos saya. ada yang ingin di tanyakan?';
    var CHIP_LABELS = ['Tentang Saya', 'Keahlian', 'Project', 'Pengalaman', 'Sertifikat', 'Kontak'];

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
        msg.setAttribute('role', 'article');
        msg.setAttribute('aria-label', isUser ? 'Anda' : 'AI');
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
        wrapper.setAttribute('role', 'status');
        wrapper.setAttribute('aria-label', 'AI sedang mengetik');

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

        function respond() {
            console.log('[AI Panel] Generating response...');
            var response = PortfolioAI.generateResponse(text);
            console.log('[AI Panel] Response ready.');
            removeTypingIndicator(typing);
            addMessage(response, false);
        }

        if (aiReady) {
            setTimeout(respond, 600);
        } else {
            console.log('[AI Panel] Waiting for knowledge base...');
            PortfolioAI.waitForReady().then(function () {
                aiReady = true;
                setTimeout(respond, 300);
            });
        }
    }

    function handleChip(e) {
        var text = e.target.textContent;
        if (!text) return;

        addMessage(text, true);

        var typing = createTypingIndicator();

        function respond() {
            console.log('[AI Panel] Generating response...');
            var response = PortfolioAI.generateResponse(text);
            console.log('[AI Panel] Response ready.');
            removeTypingIndicator(typing);
            addMessage(response, false);
        }

        if (aiReady) {
            setTimeout(respond, 600);
        } else {
            console.log('[AI Panel] Waiting for knowledge base...');
            PortfolioAI.waitForReady().then(function () {
                aiReady = true;
                setTimeout(respond, 300);
            });
        }
    }

    function showWelcome() {
        if (!aiPanelBody) return;

        addMessage(WELCOME_TEXT, false);

        var chipsWrap = document.createElement('div');
        chipsWrap.className = 'ai-chips';
        chipsWrap.setAttribute('role', 'group');
        chipsWrap.setAttribute('aria-label', 'Pertanyaan cepat');

        CHIP_LABELS.forEach(function (label) {
            var btn = document.createElement('button');
            btn.className = 'ai-chip';
            btn.textContent = label;
            btn.setAttribute('aria-label', 'Tanyakan: ' + label);
            btn.addEventListener('click', handleChip);
            chipsWrap.appendChild(btn);
        });

        aiPanelBody.appendChild(chipsWrap);
        scrollToBottom();
    }

    function openAiPanel() {
        if (aiPanel) {
            aiPanel.classList.add('active');
            aiPanel.setAttribute('aria-hidden', 'false');
        }
        if (aiOverlay) {
            aiOverlay.classList.add('active');
            aiOverlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';

        if (!aiOpened) {
            aiOpened = true;
            showWelcome();
        }

        if (aiInput) aiInput.focus();
    }

    function closeAiPanel() {
        if (aiPanel) {
            aiPanel.classList.remove('active');
            aiPanel.setAttribute('aria-hidden', 'true');
        }
        if (aiOverlay) {
            aiOverlay.classList.remove('active');
            aiOverlay.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
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

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAiPanel();

        if (e.key === 'Tab' && aiPanel && aiPanel.classList.contains('active')) {
            var focusable = aiPanel.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });

    // ========================================
    // CONTACT FORM - EMAILJS INTEGRATION
    // ========================================

    function showToast(message, type) {
        var existing = document.querySelector('.form-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'form-toast' + (type ? ' form-toast--' + type : '');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, 4000);
    }

    function isEmailConfigured() {
        return EMAIL_CONFIG
            && EMAIL_CONFIG.publicKey
            && EMAIL_CONFIG.serviceId
            && EMAIL_CONFIG.templateId;
    }

    var contactForm = document.getElementById('contact-form');

    if (contactForm) {
        var formFields = {
            nama: document.getElementById('form-nama'),
            email: document.getElementById('form-email'),
            subjek: document.getElementById('form-subjek'),
            pesan: document.getElementById('form-pesan'),
        };

        var formErrors = {
            nama: document.getElementById('error-nama'),
            email: document.getElementById('error-email'),
            subjek: document.getElementById('error-subjek'),
            pesan: document.getElementById('error-pesan'),
        };

        var fieldNames = ['nama', 'email', 'subjek', 'pesan'];

        function clearError(key) {
            formErrors[key].classList.remove('show');
            formFields[key].classList.remove('error');
        }

        function showError(key) {
            formErrors[key].classList.add('show');
            formFields[key].classList.add('error');
        }

        fieldNames.forEach(function (key) {
            formFields[key].addEventListener('input', function () {
                clearError(key);
            });
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var isValid = true;
            var values = {};

            fieldNames.forEach(function (key) {
                var val = formFields[key].value.trim();
                values[key] = val;
                if (!val) {
                    showError(key);
                    isValid = false;
                } else {
                    clearError(key);
                }
            });

            if (values.email) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(values.email)) {
                    formErrors.email.textContent = 'Format email tidak valid';
                    showError('email');
                    isValid = false;
                } else {
                    formErrors.email.textContent = 'Email wajib diisi';
                }
            }

            if (!isValid) return;

            if (!isEmailConfigured()) return;

            var submitBtn = document.getElementById('form-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
            }

            var templateParams = {
                from_name: values.nama,
                from_email: values.email,
                subject: values.subjek,
                message: values.pesan
            };

            emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, templateParams, EMAIL_CONFIG.publicKey)
                .then(function () {
                    showToast('Pesan berhasil dikirim!', 'success');
                    contactForm.reset();
                })
                .catch(function () {
                    showToast('Gagal mengirim pesan. Silakan coba lagi.', 'error');
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '';
                    }
                });
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
        initSkillFloat();
    });

    // Expose markBootShown globally agar boot.js bisa memanggil
    window.portfolioMarkBootShown = markBootShown;

    // Cek session saat load
    checkBootSession();

})();
