// Hero tagline typing efekt
(function () {
    // Text rozdělený na segmenty — string = znaky k napsání, null = <br>
    const segments = [
        '„Natáčím, řídím produkce',
        null,
        'a občas dělám obojí najednou."'
    ];

    const el = document.getElementById('hero-tagline');
    if (!el) return;

    const cursor = el.querySelector('.typing-cursor');

    // Rozbal segmenty do pole kroků: znaky nebo {br:true}
    const steps = [];
    segments.forEach(seg => {
        if (seg === null) { steps.push({ br: true }); }
        else { for (const ch of seg) steps.push(ch); }
    });

    let i = 0;
    // Průměrná rychlost + malá náhodnost pro přirozený dojem
    const baseDelay = 38;

    function typeNext() {
        if (i >= steps.length) {
            cursor.classList.add('is-done');
            return;
        }

        const step = steps[i++];

        if (step && step.br) {
            cursor.before(document.createElement('br'));
        } else {
            const text = document.createTextNode(step);
            cursor.before(text);
        }

        const jitter = (Math.random() - 0.5) * 20;
        setTimeout(typeNext, baseDelay + jitter);
    }

    // Počkej na dokončení heroFadeIn (1,1s) + malý buffer
    setTimeout(typeNext, 1300);
})();

// Nav — přidá třídu .scrolled po odscrollování
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Hero parallax — jemný pohyb pozadí při scrollování
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
    if (heroBg) {
        const scrollY = window.scrollY;
        heroBg.style.transform = `scale(1.06) translateY(${scrollY * 0.25}px)`;
    }
}, { passive: true });

// Scroll-triggered fade-in animace
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function animate(selector, delay = 0) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('anim-fade');
            if (delay) el.style.transitionDelay = delay + 's';
            observer.observe(el);
        });
    }

    function animateStagger(selector, childSelector, step = 0.1) {
        document.querySelectorAll(selector).forEach(group => {
            group.querySelectorAll(childSelector).forEach((el, i) => {
                el.classList.add('anim-fade');
                el.style.transitionDelay = (i * step) + 's';
                observer.observe(el);
            });
        });
    }

    // O mně
    animate('.about-text .section-tag');
    animate('.about-bio');
    animate('.about-stats');
    animate('.about-photo-wrap');
    animate('.clients');

    // Kategorie headery
    animate('.category-title');
    animate('.category-intro');

    // Work karty — stagger v každém gridu
    animateStagger('.work-grid', '.work-card', 0.08);

    // Eventy
    animate('.eventy-layout');

    // Produkce
    animate('.production-headline');
    animate('.production-lead');
    animateStagger('.production-claims', '.claim-item', 0.1);

    // Focení
    animate('.photo-gallery-placeholder');

    // Kontakt
    animate('.contact-heading');
    animate('.contact-sub');
    animate('.contact-form');
    animate('.contact-links');
}

initScrollAnimations();

// Count-up animace statistik
function format1000(n) {
    return n >= 1000
        ? Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0')
        : String(n);
}

// Nastav min-width ihned při načtení stránky — nuly jsou ve stejné pozici jako finální čísla
document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format;
    const finalText = (format === 'thousands' ? format1000(target) : target) + suffix;
    el.textContent = finalText;
    el.style.display  = 'inline-block';
    el.style.minWidth = el.offsetWidth + 'px';
    el.textContent = '0' + suffix;
});

function animateCountUp(el) {
    const target   = parseInt(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const format   = el.dataset.format;
    const duration = 1400;
    const start    = performance.now();

    function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4);
        const current  = Math.round(eased * target);
        el.textContent = (format === 'thousands' ? format1000(current) : current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCountUp(entry.target);
            countObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

// Side navigation — aktivní sekce
const sideNav = document.getElementById('side-nav');
const sideNavLinks = document.querySelectorAll('.side-nav-link');
const trackedSections = document.querySelectorAll('section[id], .work-category[id]');
const heroLink = document.querySelector('.side-nav-link[href="#hero"]');

function updateSideNav() {
    let activeId = trackedSections[0]?.id || '';
    trackedSections.forEach(section => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.5) {
            activeId = section.id;
        }
    });
    sideNavLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + activeId);
    });
    sideNav.classList.toggle('is-hidden', activeId === 'hero');
}

// Skryj při hoveru na Úvod

window.addEventListener('scroll', updateSideNav, { passive: true });
updateSideNav();

// Lightbox
const lightbox          = document.getElementById('lightbox');
const lightboxIframe    = document.getElementById('lightbox-iframe');
const lightboxVideoWrap = document.getElementById('lightbox-video-wrap');
const lightboxPhotoWrap = document.getElementById('lightbox-photo-wrap');
const lightboxPhoto     = document.getElementById('lightbox-photo');
const lightboxCounter   = document.getElementById('lightbox-counter');
const lightboxTitle     = document.getElementById('lightbox-title');
const lightboxDesc      = document.getElementById('lightbox-desc');
const lightboxCredit    = document.getElementById('lightbox-credit');
const lightboxClose     = document.getElementById('lightbox-close');
const lightboxBackdrop  = document.getElementById('lightbox-backdrop');
const lightboxPrev      = document.getElementById('lightbox-prev');
const lightboxNext      = document.getElementById('lightbox-next');

let photoGallery = [];
let photoIndex   = 0;

function showPhoto(index) {
    photoIndex = (index + photoGallery.length) % photoGallery.length;
    lightboxPhoto.src = photoGallery[photoIndex];
    lightboxCounter.textContent = `${photoIndex + 1} / ${photoGallery.length}`;
}

function openLightbox(card) {
    const type   = card.dataset.type;
    const id     = card.dataset.id;
    const title  = card.dataset.title  || '';
    const desc   = card.dataset.desc   || '';
    const credit = card.dataset.credit || '';

    if (type === 'photos') {
        // Foto galerie
        photoGallery = JSON.parse(card.dataset.photos || '[]');
        lightboxVideoWrap.style.display = 'none';
        lightboxPhotoWrap.classList.add('is-active');
        showPhoto(0);
    } else {
        // Video
        let src = '';
        if (type === 'youtube') src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
        if (type === 'vimeo')   src = `https://player.vimeo.com/video/${id}?autoplay=1`;
        lightboxIframe.src = src;
        lightboxVideoWrap.style.display = '';
        lightboxPhotoWrap.classList.remove('is-active');
    }

    lightboxTitle.innerHTML  = title;
    lightboxDesc.innerHTML   = desc;
    lightboxCredit.innerHTML = credit;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxIframe.src  = '';
    lightboxPhoto.src   = '';
    photoGallery        = [];
    lightboxPhotoWrap.classList.remove('is-active');
    lightboxVideoWrap.style.display = '';
    document.body.style.overflow = '';
}

lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(photoIndex - 1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(photoIndex + 1); });

document.querySelectorAll('.work-card[data-type]').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
});

// Focení — masonry galerie
const foceniPhotos = Array.from(document.querySelectorAll('.photo-masonry img')).map(img => img.src);

function openFoceniGallery(startIndex) {
    photoGallery = foceniPhotos;
    lightboxVideoWrap.style.display = 'none';
    lightboxPhotoWrap.classList.add('is-active');
    lightboxTitle.innerHTML  = '';
    lightboxDesc.innerHTML   = '';
    lightboxCredit.innerHTML = '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showPhoto(startIndex);
}

document.querySelectorAll('.photo-masonry img').forEach((img, i) => {
    img.addEventListener('click', () => openFoceniGallery(i));
});

document.getElementById('photo-gallery-btn')?.addEventListener('click', () => openFoceniGallery(0));

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft'  && photoGallery.length) showPhoto(photoIndex - 1);
    if (e.key === 'ArrowRight' && photoGallery.length) showPhoto(photoIndex + 1);
});

// Eventy — featured switching
const eventCards = [
    {
        type: 'photo',
        img: 'assets/images/signify/signify_01.jpg',
        placeholder: null,
        title: 'Signify',
        sub: 'Fotodokumentace architektonického eventu',
        tags: '',
        videoType: null, videoId: null,
        desc: 'Focení za náročných podmínek: venku, za tmy, s osvětlenými budovami jako hlavním motivem a lidmi v pohybu kolem. K tomu interiérové záběry z prezentace a večeře — opět za nízkého světla. Výsledek? Série fotek, které zachycují atmosféru večera přesně tak, jak ho zažili účastníci.',
        credit: null,
        photos: ['assets/images/signify/signify_01.jpg','assets/images/signify/signify_02.jpg','assets/images/signify/signify_03.jpg','assets/images/signify/signify_04.jpg','assets/images/signify/signify_05.jpg','assets/images/signify/signify_06.jpg','assets/images/signify/signify_07.jpg','assets/images/signify/signify_08.jpg','assets/images/signify/signify_09.jpg','assets/images/signify/signify_10.jpg','assets/images/signify/signify_11.jpg']
    },
    {
        type: 'video',
        img: 'https://img.youtube.com/vi/Ikp6wi3Y1B8/maxresdefault.jpg',
        placeholder: null,
        title: 'eDO Finance',
        sub: 'Aftermovie z konference 2026',
        tags: '',
        imgPosition: 'left center',
        videoType: 'youtube', videoId: 'Ikp6wi3Y1B8',
        desc: 'Konference je víc než přednášky a panely — jsou to setkání, energie a momenty mezi řečníky. Aftermovie z konference eDO 2026 tohle zachycuje: od příprav přes hlavní program až po neformální část. Projekt jsem vedl jako projektový manažer, account manažer a kameraman, koordinoval tým na place a odpovídal za finální výstup.',
        credit: 'Realizováno v rámci Pixbo Studio'
    },
    {
        type: 'photo',
        img: 'assets/images/korzo/korzo_01.jpg',
        placeholder: null,
        title: 'Korzo Národní',
        sub: 'Fotodokumentace — Díky že Můžem',
        tags: '',
        videoType: null, videoId: null,
        desc: 'Jeden den, stovky momentů, desítky různých akcí. Jako jeden z fotografů celé události jsem měl za úkol zachytit atmosféru oslav 17. listopadu na Národní třídě — lidi, emoce, různá pódia i prostory. Během jediného dne jsem nafotil, upravil a dodal přes 250 fotek, protože aktuálnost zde byla klíčová.',
        credit: null,
        photos: ['assets/images/korzo/korzo_01.jpg','assets/images/korzo/korzo_02.jpg','assets/images/korzo/korzo_03.jpg','assets/images/korzo/korzo_04.jpg','assets/images/korzo/korzo_05.jpg','assets/images/korzo/korzo_06.jpg','assets/images/korzo/korzo_07.jpg','assets/images/korzo/korzo_08.jpg','assets/images/korzo/korzo_09.jpg','assets/images/korzo/korzo_10.jpg','assets/images/korzo/korzo_11.jpg']
    }
];

let eventMainIndex = 0;
const thumbIndices = [1, 2];

function renderEventyMain(index) {
    const card    = eventCards[index];
    const visual  = document.getElementById('eventy-main-visual');
    const ph      = document.getElementById('eventy-main-placeholder');
    const titleEl = document.getElementById('eventy-main-title');
    const subEl   = document.getElementById('eventy-main-sub');
    const descEl  = document.getElementById('eventy-main-desc');
    const tagsEl  = document.getElementById('eventy-main-tags');
    const playBtn = document.getElementById('eventy-main-playbtn');

    let img = visual.querySelector('img');
    if (card.img) {
        if (!img) { img = document.createElement('img'); visual.insertBefore(img, ph); }
        img.src = card.img; img.alt = card.title; img.style.display = 'block';
        if (ph) ph.style.display = 'none';
    } else {
        if (img) img.style.display = 'none';
        if (ph) { ph.style.display = 'flex'; ph.textContent = card.placeholder; }
    }

    if (playBtn) playBtn.innerHTML = card.type === 'video' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
    titleEl.textContent  = card.title;
    subEl.textContent    = card.sub;
    descEl.textContent   = card.desc || '';
    tagsEl.innerHTML     = card.tags;

    visual.style.cursor = (card.videoType || (card.photos && card.photos.length)) ? 'pointer' : 'default';
}

function renderEventyThumbs(mainIndex) {
    const others = [0, 1, 2].filter(i => i !== mainIndex);
    others.forEach((cardIndex, slot) => {
        const thumb  = document.getElementById(`eventy-thumb-${slot}`);
        const tvEl   = document.getElementById(`eventy-tv-${slot}`);
        const metaEl = document.getElementById(`eventy-tmeta-${slot}`);
        if (!thumb || !tvEl || !metaEl) return;

        const card = eventCards[cardIndex];
        thumb.dataset.eventy = cardIndex;

        let img = tvEl.querySelector('img');
        let ph  = tvEl.querySelector('.work-card-placeholder');
        const playBtn = tvEl.querySelector('.play-btn');

        if (card.img) {
            if (!img) { img = document.createElement('img'); tvEl.insertBefore(img, tvEl.firstChild); }
            img.src = card.img; img.style.display = 'block';
            img.style.objectPosition = card.imgPosition || 'center';
            if (ph) ph.style.display = 'none';
        } else {
            if (img) img.style.display = 'none';
            if (!ph) { ph = document.createElement('div'); ph.className = 'work-card-placeholder'; tvEl.insertBefore(ph, tvEl.firstChild); }
            ph.style.display = 'flex'; ph.textContent = card.placeholder;
        }
        if (playBtn) playBtn.innerHTML = card.type === 'video' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
        thumb.style.cursor = (card.videoType || (card.photos && card.photos.length)) ? 'pointer' : 'default';

        const spans = metaEl.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = card.title;
        if (spans[1]) spans[1].textContent = card.sub;
    });
}

function switchEventyTo(newMainIndex) {
    if (newMainIndex === eventMainIndex) return;

    const mainVisual = document.getElementById('eventy-main-visual');
    const mainMeta   = document.getElementById('eventy-main-meta');
    const others     = [0, 1, 2].filter(i => i !== newMainIndex);
    const slot       = others.indexOf(eventMainIndex);
    const thumbVisual = document.getElementById(`eventy-tv-${slot}`);

    mainVisual.classList.add('is-switching');
    mainMeta.classList.add('is-switching');
    if (thumbVisual) thumbVisual.classList.add('is-switching');

    setTimeout(() => {
        eventMainIndex = newMainIndex;
        renderEventyMain(eventMainIndex);
        renderEventyThumbs(eventMainIndex);
        mainVisual.classList.remove('is-switching');
        mainMeta.classList.remove('is-switching');
        document.querySelectorAll('.eventy-thumb-visual').forEach(v => v.classList.remove('is-switching'));
    }, 300);
}

document.querySelectorAll('.eventy-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
        switchEventyTo(parseInt(thumb.dataset.eventy));
    });
});

// Klik na hlavní eventy visual — foto galerie nebo video
document.getElementById('eventy-main-visual').addEventListener('click', () => {
    const card = eventCards[eventMainIndex];
    if (card.videoType) {
        openLightbox({
            dataset: { type: card.videoType, id: card.videoId,
                       title: card.title, desc: card.desc || '', credit: card.credit || '' }
        });
    } else if (card.photos && card.photos.length) {
        openLightbox({
            dataset: { type: 'photos', photos: JSON.stringify(card.photos),
                       title: card.title, desc: '', credit: '' }
        });
    }
});

renderEventyMain(0);
renderEventyThumbs(0);

// About glow — cestuje po stránce při scrollování
const glow = document.querySelector('.about-glow');
const aboutSection = document.getElementById('o-mne');

window.addEventListener('scroll', () => {
    if (!glow || !aboutSection) return;

    const rect = aboutSection.getBoundingClientRect();
    // Začne když sekce vstoupí do viewportu, skončí když odscrolluje 25% své výšky
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height * 0.4)));

    // Trasa: stats (vlevo dole) → za fotkou (vpravo střed) → roh (vpravo nahoře)
    // Každý bod: [left%, top%]
    const p0 = [22, 72];   // start: oblast "200+ klientů"
    const p1 = [68, 45];   // střed: za fotkou
    const p2 = [95, -5];   // konec: pravý horní roh

    let x, y;
    if (progress < 0.5) {
        const t = progress / 0.5;
        x = p0[0] + (p1[0] - p0[0]) * t;
        y = p0[1] + (p1[1] - p0[1]) * t;
    } else {
        const t = (progress - 0.5) / 0.5;
        x = p1[0] + (p2[0] - p1[0]) * t;
        y = p1[1] + (p2[1] - p1[1]) * t;
    }

    glow.style.left = `${x}%`;
    glow.style.top  = `${y}%`;
}, { passive: true });
