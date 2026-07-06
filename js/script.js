const tahunElement = document.getElementById('tahun-copyright');
tahunElement.textContent = new Date().getFullYear();

console.log('Website profil ezy berhasil dimuat!');

const navLinks = document.querySelectorAll('.nav-menu a');
const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((section) => section !== null);

function setActiveMenu() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    let activeSectionId = sections[0].id;

    sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
            activeSectionId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const linkSectionId = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', linkSectionId === activeSectionId);
    });
}

window.addEventListener('scroll', setActiveMenu);
window.addEventListener('load', setActiveMenu);
