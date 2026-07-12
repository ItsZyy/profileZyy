/**
 * ai-engine.js
 * ============
 * Portfolio AI - Knowledge Base Loader
 *
 * Memuat data dari data/portfolio.json dan menyimpannya
 * sebagai knowledge base yang siap digunakan oleh AI Assistant.
 */

var PortfolioAI = (function () {
    'use strict';

    var _data = null;
    var _ready = false;
    var _error = null;

    // ========================================
    // LOAD KNOWLEDGE BASE
    // ========================================

    function loadKnowledge() {
        return fetch('data/portfolio.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                }
                return response.json();
            })
            .then(function (json) {
                _data = json;
                _ready = true;
                _error = null;
                console.log('[PortfolioAI] Knowledge base loaded successfully.');
                return _data;
            })
            .catch(function (err) {
                _data = null;
                _ready = false;
                _error = err.message || 'Gagal memuat data portfolio.';
                console.error('[PortfolioAI] Failed to load knowledge base:', _error);
                return null;
            });
    }

    // ========================================
    // ACCESSORS
    // ========================================

    function getKnowledge() {
        return _data;
    }

    function isReady() {
        return _ready;
    }

    function getError() {
        return _error;
    }

    // ========================================
    // SECTION HELPERS
    // ========================================

    function getProfile() {
        return _data ? _data.profile || null : null;
    }

    function getAbout() {
        return _data ? _data.about || '' : '';
    }

    function getSkills() {
        return _data ? _data.skills || [] : [];
    }

    function getExperience() {
        return _data ? _data.experience || [] : [];
    }

    function getEducation() {
        return _data ? _data.education || [] : [];
    }

    function getProjects() {
        return _data ? _data.projects || [] : [];
    }

    function getCertificates() {
        return _data ? _data.certificates || [] : [];
    }

    function getContact() {
        return _data ? _data.contact || null : null;
    }

    // Auto-load saat script dimuat
    loadKnowledge();

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        loadKnowledge: loadKnowledge,
        getKnowledge: getKnowledge,
        isReady: isReady,
        getError: getError,
        getProfile: getProfile,
        getAbout: getAbout,
        getSkills: getSkills,
        getExperience: getExperience,
        getEducation: getEducation,
        getProjects: getProjects,
        getCertificates: getCertificates,
        getContact: getContact
    };

})();
