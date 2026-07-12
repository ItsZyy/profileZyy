/**
 * ai-engine.js
 * ============
 * Portfolio AI - Knowledge Base & Intent Recognition
 *
 * Memuat data dari data/portfolio.json dan mendeteksi
 * intent dari pertanyaan pengguna dengan preprocessing
 * yang lebih cerdas (sinonim, partial match, scoring).
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
                'pekerjaan', 'title', 'jabatan', 'status', 'brand'
            ],
            phrases: [
                'kamu siapa', 'anda siapa', 'tentang siapa',
                'ini siapa', 'dia siapa', 'siapa dia',
                'kenalan', 'perkenalan'
            ],
            stems: [
                'profil', 'identitas', 'kenal'
            ]
        },
        about: {
            keywords: [
                'about', 'tentang', 'cerita', 'deskripsi', 'bio',
                'pengenalan', 'latar belakang', 'menjelaskan', 'gambaran'
            ],
            phrases: [
                'tentang saya', 'tentang kamu', 'tentang dia',
                'siapa itu', 'apa itu ezy', 'ceritakan tentang',
                'jelaskan tentang', 'gambarkan'
            ],
            stems: [
                'tentang', 'cerita', 'jelas', 'gambar'
            ]
        },
        skills: {
            keywords: [
                'skill', 'keahlian', 'kemampuan', 'teknologi',
                'tools', 'alat', 'menguasai', 'bisa',
                'framework', 'library', 'database', 'coding'
            ],
            phrases: [
                'tech stack', 'bahasa pemrograman', 'programming',
                'kamu bisa apa', 'skill kamu apa', 'bisa apa',
                'menguasai apa', 'pakai apa', 'gunakan apa',
                'keahlian utama', 'kemampuan anda',
                'tech apa', 'teknologi apa'
            ],
            stems: [
                'skill', 'ahli', 'kuasai', 'bisa', 'program',
                'teknologi', 'tools', 'kode', 'coding'
            ]
        },
        experience: {
            keywords: [
                'experience', 'pengalaman', 'kerja', 'kerjaan',
                'magang', 'intern', 'pkl', 'organisasi',
                'kegiatan', 'riwayat', 'karir'
            ],
            phrases: [
                'pengalaman kerja', 'pengalaman magang',
                'riwayat kerja', 'pernah kerja', 'aktifitas'
            ],
            stems: [
                'pengalaman', 'kerja', 'magang', 'aktifitas'
            ]
        },
        education: {
            keywords: [
                'education', 'pendidikan', 'sekolah', 'kuliah',
                'universitas', 'kampus', 'lulus', 'alma mater',
                'study', 'studi', 'akademik', 'jenjang'
            ],
            phrases: [
                'alma mater', 'tempat kuliah', 'sekolah mana',
                'jurusan apa', 'lulus dimana'
            ],
            stems: [
                'sekolah', 'kuliah', 'didik', 'stud'
            ]
        },
        projects: {
            keywords: [
                'project', 'proyek', 'karya', 'portofolio',
                'aplikasi', 'website', 'build', 'hasil',
                'repository', 'repo'
            ],
            phrases: [
                'github project', 'pernah buat', 'project apa',
                'aplikasi apa', 'website apa', 'karya apa'
            ],
            stems: [
                'project', 'proyek', 'karya', 'aplikasi'
            ]
        },
        certificates: {
            keywords: [
                'certificate', 'sertifikat', 'sertif', 'ijazah',
                'kualifikasi', 'badge', 'credential', 'penghargaan',
                'lomba', 'kompetisi', 'competition', 'debat'
            ],
            phrases: [
                'pernah menang', 'juara', 'penghargaan apa'
            ],
            stems: [
                'sertif', 'lomba', 'juara', 'harga'
            ]
        },
        contact: {
            keywords: [
                'contact', 'kontak', 'hubungi', 'email',
                'telepon', 'phone', 'wa', 'whatsapp', 'sms',
                'menghubungi', 'alamat', 'domisili'
            ],
            phrases: [
                'bagaimana cara menghubungi',
                'bisa dihubungi', 'nomor telepon'
            ],
            stems: [
                'hubung', 'kontak', 'telepon', 'email'
            ]
        },
        social: {
            keywords: [
                'social', 'sosial', 'media sosial', 'instagram',
                'github', 'twitter', 'linkedin', 'youtube',
                'tiktok', 'facebook', 'follow', 'akun'
            ],
            phrases: [
                'media sosial', 'akun instagram',
                'akun github', 'follow'
            ],
            stems: [
                'sosial', 'media', 'follow', 'akun'
            ]
        }
    };

    // ========================================
    // SYNONYM MAP
    // ========================================

    var SYNONYMS = {
        'bisa':       ['mampu', 'dapat', 'able', 'capable', 'pandai'],
        'kuasai':     ['menguasai', 'mahir', 'jago', 'pintar', 'terampil', 'mastery'],
        'skill':      ['skill', 'keahlian', 'kemampuan', 'keterampilan', 'ability'],
        'teknologi':  ['tech', 'teknologi', 'stack'],
        'program':    ['coding', 'programming', 'pemrograman', 'developer'],
        'kerja':      ['kerja', 'bekerja', 'employment', 'job', 'work'],
        'sekolah':    ['school', 'sekolah', 'kampus', 'kuliah', 'universitas'],
        'project':    ['proyek', 'karya', 'build', 'hasil', 'aplikasi', 'portofolio'],
        'sertif':     ['sertifikat', 'certificate', 'badge', 'credential'],
        'kontak':     ['contact', 'hubungi', 'menghubungi'],
        'sosial':     ['social', 'media sosial'],
        'tentang':    ['about', 'deskripsi', 'bio', 'pengenalan'],
        'pengalaman': ['experience', 'riwayat', 'karir']
    };

    // ========================================
    // PREPROCESSING
    // ========================================

    function preprocessText(text) {
        var lower = text.toLowerCase();
        var cleaned = lower
            .replace(/['']/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return cleaned;
    }

    function getWords(text) {
        return text.split(' ').filter(function (w) {
            return w.length > 0;
        });
    }

    function expandSynonyms(words) {
        var expanded = [];
        words.forEach(function (word) {
            expanded.push(word);
            Object.keys(SYNONYMS).forEach(function (key) {
                var syns = SYNONYMS[key];
                if (word === key || syns.indexOf(word) !== -1) {
                    expanded.push(key);
                    syns.forEach(function (s) {
                        if (expanded.indexOf(s) === -1) {
                            expanded.push(s);
                        }
                    });
                }
            });
        });
        return expanded;
    }

    // ========================================
    // SCORING
    // ========================================

    function calculateScore(words, expanded, normalized) {
        var scores = {};

        Object.keys(INTENTS).forEach(function (intent) {
            var def = INTENTS[intent];
            var score = 0;

            def.keywords.forEach(function (kw) {
                var kn = kw.toLowerCase();
                for (var i = 0; i < expanded.length; i++) {
                    if (expanded[i] === kn) {
                        score += 2;
                        break;
                    }
                }
            });

            if (def.phrases) {
                def.phrases.forEach(function (phrase) {
                    var pn = phrase.toLowerCase();
                    if (normalized.indexOf(pn) !== -1) {
                        score += 4;
                    }
                });
            }

            if (def.stems) {
                def.stems.forEach(function (stem) {
                    var sn = stem.toLowerCase();
                    for (var i = 0; i < words.length; i++) {
                        var w = words[i];
                        if (w.length >= 4 && w.indexOf(sn) !== -1) {
                            score += 1.5;
                        } else if (w === sn) {
                            score += 2;
                        }
                    }
                });
            }

            scores[intent] = score;
        });

        return scores;
    }

    // ========================================
    // INTENT DETECTION
    // ========================================

    function findBestIntent(input) {
        var normalized = preprocessText(input);
        var words = getWords(normalized);
        var expanded = expandSynonyms(words);
        var scores = calculateScore(words, expanded, normalized);

        var bestIntent = null;
        var bestScore = 0;

        Object.keys(scores).forEach(function (intent) {
            if (scores[intent] > bestScore) {
                bestScore = scores[intent];
                bestIntent = intent;
            }
        });

        return {
            intent: bestIntent,
            score: bestScore,
            scores: scores
        };
    }

    function detectIntent(input) {
        var result = findBestIntent(input);
        var MIN_SCORE = 1;
        return result.score >= MIN_SCORE ? result.intent : null;
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

    // ========================================
    // RESPONSE GENERATION
    // ========================================

    var NO_DATA_MSG = 'Maaf, informasi tersebut belum tersedia pada portfolio ini.';

    function joinList(arr, lastSeparator) {
        if (arr.length === 0) return '';
        if (arr.length === 1) return arr[0];
        if (arr.length === 2) return arr[0] + ' ' + lastSeparator + ' ' + arr[1];
        var sep = lastSeparator || 'dan';
        var last = arr.pop();
        var joined = arr.join(', ');
        return joined + ', ' + sep + ' ' + last;
    }

    function formatAbout(data) {
        if (!data) return NO_DATA_MSG;
        return 'Tentang Ezy Muhamad Ikbal:\n\n' + data;
    }

    function formatProfile(data) {
        if (!data) return NO_DATA_MSG;
        var lines = [];
        if (data.name) lines.push('Nama: ' + data.name);
        if (data.title) lines.push('Title: ' + data.title);
        if (data.brand) lines.push('Brand: ' + data.brand);
        if (data.school) lines.push('Sekolah: ' + data.school);
        if (data.major) lines.push('Jurusan: ' + data.major);
        if (data.status) lines.push('Status: ' + data.status);
        return lines.length > 0 ? lines.join('\n') : NO_DATA_MSG;
    }

    function formatSkills(data) {
        if (!data || data.length === 0) return NO_DATA_MSG;

        var grouped = {};
        data.forEach(function (skill) {
            var cat = skill.category || 'Lainnya';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(skill.name);
        });

        var cats = Object.keys(grouped);
        var lines = [];

        cats.forEach(function (cat) {
            lines.push('[' + cat + '] ' + joinList(grouped[cat], 'dan'));
        });

        return 'Skill yang dikuasai Ezy:\n\n' + lines.join('\n\n');
    }

    function formatExperience(data) {
        if (!data || data.length === 0) return NO_DATA_MSG;

        var lines = [];
        data.forEach(function (exp) {
            var line = '';
            if (exp.role) line += exp.role;
            if (exp.company) line += ' di ' + exp.company;
            if (exp.period) line += '\n   Periode: ' + exp.period;
            if (exp.description) line += '\n   ' + exp.description;
            lines.push(line);
        });

        return 'Pengalaman Ezy:\n\n' + lines.join('\n\n');
    }

    function formatEducation(data) {
        if (!data || data.length === 0) return NO_DATA_MSG;

        var lines = [];
        data.forEach(function (edu) {
            var line = '';
            if (edu.level) line += edu.level;
            if (edu.institution) line += ' - ' + edu.institution;
            if (edu.major) line += '\n   Jurusan: ' + edu.major;
            if (edu.year) line += '\n   Tahun: ' + edu.year;
            lines.push(line);
        });

        return 'Pendidikan Ezy:\n\n' + lines.join('\n\n');
    }

    function formatProjects(data) {
        if (!data || data.length === 0) return NO_DATA_MSG;

        var lines = [];
        data.forEach(function (proj) {
            var line = proj.title || proj.name || 'Project';
            if (proj.type) line += ' [' + proj.type + ']';
            if (proj.description) line += '\n   ' + proj.description;
            if (proj.tech && proj.tech.length > 0) {
                line += '\n   Tech: ' + joinList(proj.tech, 'dan');
            }
            lines.push(line);
        });

        return 'Project yang pernah dibuat Ezy:\n\n' + lines.join('\n\n');
    }

    function formatCertificates(data) {
        if (!data || data.length === 0) return NO_DATA_MSG;

        var lines = [];
        data.forEach(function (cert) {
            var line = cert.name || cert.title || 'Sertifikat';
            if (cert.issuer) line += ' (' + cert.issuer + ')';
            if (cert.date) line += '\n   Tanggal: ' + cert.date;
            if (cert.category) line += '\n   Kategori: ' + cert.category;
            lines.push(line);
        });

        return 'Sertifikat yang dimiliki Ezy:\n\n' + lines.join('\n\n');
    }

    function formatContact(data) {
        if (!data) return NO_DATA_MSG;

        var lines = [];
        if (data.email) lines.push('Email: ' + data.email);
        if (data.phone) lines.push('Telepon: ' + data.phone);
        if (data.location) lines.push('Lokasi: ' + data.location);
        if (data.address) lines.push('Alamat: ' + data.address);

        return 'Kontak Ezy Muhamad Ikbal:\n\n' + lines.join('\n');
    }

    function formatSocial(data) {
        if (!data) return NO_DATA_MSG;

        var lines = [];
        if (data.instagram) lines.push('Instagram: ' + data.instagram);
        if (data.github) lines.push('GitHub: ' + data.github);
        if (data.linkedin) lines.push('LinkedIn: ' + data.linkedin);
        if (data.youtube) lines.push('YouTube: ' + data.youtube);
        if (data.tiktok) lines.push('TikTok: ' + data.tiktok);

        return 'Media sosial Ezy:\n\n' + lines.join('\n');
    }

    function getSectionData(intent) {
        switch (intent) {
            case 'profile':      return getProfile();
            case 'about':        return getAbout();
            case 'skills':       return getSkills();
            case 'experience':   return getExperience();
            case 'education':    return getEducation();
            case 'projects':     return getProjects();
            case 'certificates': return getCertificates();
            case 'contact':      return getContact();
            case 'social':       return getContact();
            default:             return null;
        }
    }

    function formatResponse(intent, data) {
        switch (intent) {
            case 'profile':      return formatProfile(data);
            case 'about':        return formatAbout(data);
            case 'skills':       return formatSkills(data);
            case 'experience':   return formatExperience(data);
            case 'education':    return formatEducation(data);
            case 'projects':     return formatProjects(data);
            case 'certificates': return formatCertificates(data);
            case 'contact':      return formatContact(data);
            case 'social':       return formatSocial(data);
            default:             return null;
        }
    }

    function generateResponse(input) {
        if (!_ready || !_data) {
            return 'Knowledge base belum siap. Silakan coba lagi nanti.';
        }

        var trimmed = (input || '').trim();
        if (trimmed.length === 0) {
            return 'Silakan ketik pertanyaan tentang Ezy.';
        }

        var intent = detectIntent(trimmed);

        if (!intent) {
            return 'Maaf, saya belum memahami pertanyaan tersebut.\n\n'
                 + 'Anda bisa bertanya tentang:\n'
                 + '- Tentang Ezy (siapa, profil)\n'
                 + '- Skill / keahlian\n'
                 + '- Pendidikan\n'
                 + '- Pengalaman\n'
                 + '- Project\n'
                 + '- Sertifikat\n'
                 + '- Kontak / media sosial';
        }

        var data = getSectionData(intent);
        var response = formatResponse(intent, data);

        return response || NO_DATA_MSG;
    }
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
        findBestIntent: findBestIntent,
        getIntentKeywords: getIntentKeywords,
        generateResponse: generateResponse,
        formatContact: formatContact,
        formatSocial: formatSocial
    };

})();
