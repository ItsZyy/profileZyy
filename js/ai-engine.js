/**
 * ai-engine.js
 * ============
 * Portfolio AI - Knowledge Base & Intent Recognition
 *
 * Memuat data dari data/portfolio.json dan mendeteksi
 * intent dari pertanyaan pengguna.
 */

var PortfolioAI = (function () {
    'use strict';

    var _data = null;
    var _ready = false;
    var _error = null;

    // ========================================
    // INTENT DEFINITIONS
    // ========================================

    var INTENTS = {
        profile: {
            keywords: [
                'siapa', 'nama', 'profile', 'profil', 'identitas',
                'kamu siapa', 'anda siapa', 'tentang siapa',
                'pekerjaan', 'title', 'jabatan', 'sekolah',
                'jurusan', 'status', 'brand'
            ]
        },
        about: {
            keywords: [
                'about', 'tentang', 'cerita', 'deskripsi', 'bio',
                'pengenalan', 'latar belakang', 'siapa dia',
                'apa itu', 'menjelaskan', 'gambaran'
            ]
        },
        skills: {
            keywords: [
                'skill', 'keahlian', 'kemampuan', 'teknologi',
                'tech stack', 'bahasa pemrograman', 'programming',
                'tools', 'alat', 'menguasai', 'bisa',
                'framework', 'library', 'database'
            ]
        },
        experience: {
            keywords: [
                'experience', 'pengalaman', 'kerja', 'kerjaan',
                'magang', 'intern', 'pkl', 'organisasi',
                'kegiatan', 'aktifitas', 'riwayat', 'karir'
            ]
        },
        education: {
            keywords: [
                'education', 'pendidikan', 'sekolah', 'kuliah',
                'universitas', 'kampus', 'lulus', 'alma mater',
                'study', 'studi', 'akademik', 'jenjang'
            ]
        },
        projects: {
            keywords: [
                'project', 'proyek', 'karya', 'portofolio',
                'aplikasi', 'website', 'build', 'hasil',
                'repository', 'repo', 'github project'
            ]
        },
        certificates: {
            keywords: [
                'certificate', 'sertifikat', 'sertif', 'ijazah',
                'kualifikasi', 'badge', 'credential', 'penghargaan',
                'lomba', 'kompetisi', 'competition', 'debat'
            ]
        },
        contact: {
            keywords: [
                'contact', 'kontak', 'hubungi', 'email',
                'telepon', 'phone', 'wa', 'whatsapp', 'sms',
                'menghubungi', 'alamat', 'domisili'
            ]
        },
        social: {
            keywords: [
                'social', 'sosial', 'media sosial', 'instagram',
                'github', 'twitter', 'linkedin', 'youtube',
                'tiktok', 'facebook', 'follow', 'akun'
            ]
        }
    };

    // ========================================
    // INTENT RECOGNITION
    // ========================================

    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function detectIntent(input) {
        var normalized = normalizeText(input);
        var words = normalized.split(' ');
        var scores = {};

        Object.keys(INTENTS).forEach(function (intent) {
            scores[intent] = 0;
            var keywords = INTENTS[intent].keywords;

            keywords.forEach(function (keyword) {
                var kw = normalizeText(keyword);

                if (kw.indexOf(' ') !== -1) {
                    if (normalized.indexOf(kw) !== -1) {
                        scores[intent] += 3;
                    }
                } else {
                    for (var i = 0; i < words.length; i++) {
                        if (words[i] === kw) {
                            scores[intent] += 1;
                        }
                    }
                }
            });
        });

        var bestIntent = null;
        var bestScore = 0;

        Object.keys(scores).forEach(function (intent) {
            if (scores[intent] > bestScore) {
                bestScore = scores[intent];
                bestIntent = intent;
            }
        });

        return bestScore > 0 ? bestIntent : null;
    }

    function getIntentKeywords(intent) {
        if (INTENTS[intent]) {
            return INTENTS[intent].keywords.slice();
        }
        return [];
    }

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
        getContact: getContact,
        detectIntent: detectIntent,
        getIntentKeywords: getIntentKeywords
    };

})();
