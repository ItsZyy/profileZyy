/**
 * script.js
 * =========
 * Portfolio v2 - Arch Linux Theme
 *
 * Fitur:
 *   - Copyright year otomatis
 *   - Active menu highlight saat scroll
 *   - Navbar blur effect saat di-scroll
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

    /**
     * Menambahkan/menghapus class 'scrolled' pada navbar
     * berdasarkan posisi scroll.
     */
    function handleNavbarScroll() {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ========================================
    // ACTIVE MENU HIGHLIGHT
    // ========================================

    var navLinks = document.querySelectorAll('.nav-menu a');
    var sections = Array.from(navLinks)
        .map(function (link) {
            return document.querySelector(link.getAttribute('href'));
        })
        .filter(function (section) {
            return section !== null;
        });

    /**
     * Menandai menu aktif berdasarkan posisi scroll.
     */
    function setActiveMenu() {
        var scrollPosition = window.scrollY + window.innerHeight / 3;
        var activeSectionId = sections[0] ? sections[0].id : '';

        sections.forEach(function (section) {
            if (scrollPosition >= section.offsetTop) {
                activeSectionId = section.id;
            }
        });

        navLinks.forEach(function (link) {
            var linkSectionId = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', linkSectionId === activeSectionId);
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    function onScroll() {
        handleNavbarScroll();
        setActiveMenu();
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('load', function () {
        handleNavbarScroll();
        setActiveMenu();
    });

})();
