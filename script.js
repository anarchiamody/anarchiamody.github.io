'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const nav       = $('#nav');
const navBurger = $('#navBurger');
const navLinks  = $('#navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 60);
}, { passive: true });

navBurger.addEventListener('click', () => {
  const open = navBurger.getAttribute('aria-expanded') === 'true';
  navBurger.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('nav__links--open');
});

navLinks.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    navBurger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('nav__links--open');
  }
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

window.addEventListener('load', () => {
  $$('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 150 + i * 140);
  });
  $$('.stats-bar .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 500 + i * 110);
  });
});

const heroBg = $('.hero__bg');
window.addEventListener('scroll', () => {
  if (heroBg) heroBg.style.transform = `translateY(${window.scrollY * 0.38}px)`;
}, { passive: true });

const blockTextures = [
  'assets/blocks/grass.png',
  'assets/blocks/dirt.png',
  'assets/blocks/stone.png',
  'assets/blocks/deepslate.png',
  'assets/blocks/deepslate_diamond.png',
  'assets/blocks/deepslate_gold.png',
  'assets/blocks/deepslate_coal.png',
  'assets/blocks/bedrock.png',
];

const particleContainer = $('#heroParticles');

function spawnBlocks(count) {
  particleContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('div');
    el.className = 'fb';

    const size     = randBetween(20, 56);
    const left     = Math.random() * 100;
    const delay    = Math.random() * 10;
    const duration = randBetween(10, 20);
    const tex      = blockTextures[Math.floor(Math.random() * blockTextures.length)];

    el.style.cssText = [
      `left:${left}%`,
      `width:${size}px`,
      `height:${size}px`,
      `background-image:url('${tex}')`,
      `animation-delay:${delay}s`,
      `animation-duration:${duration}s`,
    ].join(';');

    particleContainer.appendChild(el);
  }
}

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

spawnBlocks(28);

$$('.mc-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--bx', `${((e.clientX - r.left) / r.width  * 100).toFixed(1)}%`);
    btn.style.setProperty('--by', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`);
  });
});

$$('.fcard').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

$$('.ocard').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.12}s`;
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

(function () {
  const slider   = $('#opinionSlider');
  if (!slider) return;

  const track    = $('#sliderTrack');
  const cards    = $$('.ocard', track);
  const dotsWrap = $('#sliderDots');
  const total    = cards.length;

  let current   = 0;
  let autoTimer = null;

  function visibleCount() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, total - visibleCount());
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const max = maxIndex();
    for (let i = 0; i <= max; i++) {
      const d = document.createElement('button');
      d.className = 'slider__dot' + (i === current ? ' slider__dot--active' : '');
      d.setAttribute('aria-label', `Opinia ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    $$('.slider__dot', dotsWrap).forEach((d, i) =>
      d.classList.toggle('slider__dot--active', i === current)
    );
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  let dragStartX = null;
  let isDragging = false;

  slider.addEventListener('pointerdown', e => {
    dragStartX = e.clientX;
    isDragging = false;
    stopAuto();
    slider.setPointerCapture(e.pointerId);
  });
  slider.addEventListener('pointermove', e => {
    if (dragStartX === null) return;
    if (Math.abs(e.clientX - dragStartX) > 6) isDragging = true;
  });
  slider.addEventListener('pointerup', e => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    if (isDragging) {
      if (dx < -40) goTo(current + 1);
      else if (dx > 40) goTo(current - 1);
    }
    dragStartX = null;
    isDragging = false;
    startAuto();
  });

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    }, 120);
  });

  buildDots();
  goTo(0);
  startAuto();
})();