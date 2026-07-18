// ── Entry Screen Unlock & Music Player ───────
(function initEntryScreenAndMusic() {
  const entryScreen = document.getElementById('entryScreen');
  const entryLogoButton = document.getElementById('entryLogoButton');
  const bgMusic = document.getElementById('bgMusic');
  const playPauseBtn = document.getElementById('musicPlayPauseBtn');
  if (!entryScreen || !entryLogoButton) return;
  let siteUnlocked = false;
  function playMusic() {
    if (bgMusic && bgMusic.paused) {
      bgMusic.play().then(() => {
        if (playPauseBtn) playPauseBtn.classList.add('is-playing');
      }).catch(err => {
        console.log('Autoplay blocked or audio failed to load:', err);
      });
    }
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        if (playPauseBtn) playPauseBtn.classList.add('is-playing');
      }).catch(err => console.log('Playback failed:', err));
    } else {
      bgMusic.pause();
      if (playPauseBtn) playPauseBtn.classList.remove('is-playing');
    }
  }
  function unlockSite() {
    if (siteUnlocked) return;
    siteUnlocked = true;
    document.body.classList.remove('site-locked');
    document.body.classList.add('site-unlocked');
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    // Play background music
    playMusic();
    // GSAP animation to smoothly fade and slide the entry overlay out of view
    gsap.to(entryScreen, {
      opacity: 0,
      yPercent: -100,
      duration: 1.2,
      ease: 'power3.inOut',
      onComplete: () => {
        entryScreen.classList.add('is-hidden');
      }
    });
  }
  entryLogoButton.addEventListener('click', unlockSite);
  entryLogoButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      unlockSite();
    }
  });
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', toggleMusic);
  }
})();
// â”€â”€ Register GSAP Plugins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Scratch card reveal
(function initScratchCard() {
  const scratchCard = document.getElementById('scratchCard');
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchReveal = document.getElementById('scratchReveal');
  const fireworksContainer = document.getElementById('fireworks');

  if (!scratchCard || !scratchCanvas || !scratchReveal) return;

  const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const revealThreshold = 0.35;
  const brushRadius = 30;
  let isDrawing = false;
  let isRevealed = false;
  let fireworks = null;
  let fireworksStopTimer = null;

  function getEventPoint(event) {
    const rect = scratchCanvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  }

  function startScratch(event) {
    if (isRevealed) return;

    isDrawing = true;
    scratch(event);
  }

  function stopScratch() {
    isDrawing = false;
  }

  function scratch(event) {
    if (!isDrawing || isRevealed) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    const point = getEventPoint(event);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(point.x, point.y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
  }

  function checkReveal() {
    const pixels = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    let transparent = 0;

    for (let i = 3; i < pixels.data.length; i += 4) {
      if (pixels.data[i] === 0) {
        transparent += 1;
      }
    }

    const scratched = transparent / (pixels.data.length / 4);

    if (scratched > revealThreshold && !isRevealed) {
      revealCard();
    }
  }

  function startGoldenFireworks() {
    const FireworksClass = window.Fireworks && window.Fireworks.default;
    if (!fireworksContainer || !FireworksClass) return;

    if (fireworksStopTimer) {
      clearTimeout(fireworksStopTimer);
    }

    if (fireworks) {
      fireworks.stop();
    }

    fireworks = new FireworksClass(fireworksContainer, {
      autoresize: true,
      hue: {
        min: 35,
        max: 50,
      },
      brightness: {
        min: 70,
        max: 100,
      },
      particles: 220,
      explosion: 12,
      intensity: 40,
      traceLength: 8,
      traceSpeed: 12,
      gravity: 1.2,
      friction: 0.95,
      acceleration: 1.05,
      opacity: 0.9,
      lineStyle: 'round',
      rocketsPoint: {
        min: 0,
        max: 100,
      },
      decay: {
        min: 0.015,
        max: 0.03,
      },
    });

    fireworks.start();
    fireworksStopTimer = window.setTimeout(() => {
      fireworks.stop();
    }, 15000);
  }

  function revealCard() {
    isRevealed = true;
    isDrawing = false;
    scratchCard.classList.add('is-revealed');
    scratchCanvas.style.display = 'none';
    scratchReveal.setAttribute('aria-hidden', 'false');
    startGoldenFireworks();
  }

  function resizeCanvas() {
    if (isRevealed) return;
    const rect = scratchCard.getBoundingClientRect();
    scratchCanvas.width = rect.width || 320;
    scratchCanvas.height = rect.height || 200;

    const gradient = ctx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    gradient.addColorStop(0, '#7c5c14');
    gradient.addColorStop(0.3, '#d8b65a');
    gradient.addColorStop(0.55, '#fdf0c8');
    gradient.addColorStop(0.8, '#c99a35');
    gradient.addColorStop(1, '#7c5c14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Fine diagonal foil texture lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = -scratchCanvas.height; i < scratchCanvas.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + scratchCanvas.height, scratchCanvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = '#241c0d';
    ctx.font = '600 17px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♥  SCRATCH TO REVEAL  ♥', scratchCanvas.width / 2, scratchCanvas.height / 2 - 6);
    ctx.font = '400 11px "Montserrat", sans-serif';
    ctx.fillText('OUR WEDDING DATE', scratchCanvas.width / 2, scratchCanvas.height / 2 + 18);
  }

  resizeCanvas();
  scratchReveal.setAttribute('aria-hidden', 'true');

  scratchCanvas.addEventListener('mousedown', startScratch);
  scratchCanvas.addEventListener('mouseup', stopScratch);
  scratchCanvas.addEventListener('mouseleave', stopScratch);
  scratchCanvas.addEventListener('mousemove', scratch);
  scratchCanvas.addEventListener('touchstart', startScratch, { passive: false });
  scratchCanvas.addEventListener('touchend', stopScratch);
  scratchCanvas.addEventListener('touchcancel', stopScratch);
  scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
  window.addEventListener('resize', resizeCanvas);
})();
gsap.registerPlugin(ScrollTrigger);



// ── Custom Cursor ──────────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursorGlow');
  if (!cursor) return;

  if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
    cursor.style.display = 'none';
    return;
  }

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    // Use translate3d for hardware acceleration, avoiding browser reflow calculations on left/top properties
    cursor.style.transform = `translate3d(calc(${cx}px - 50%), calc(${cy}px - 50%), 0)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .tl-card, .detail-item, .family-member-card, .save-the-date-container').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '54px';
      cursor.style.height = '54px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '28px';
      cursor.style.height = '28px';
    });
  });
})();

// ── Floating Petals ──
(function createPetals() {
  const container = document.getElementById('petalsContainer');
  const colors = [
    'rgba(200,115,122,0.55)',
    'rgba(232,165,171,0.45)',
    'rgba(201,168,76,0.35)',
    'rgba(255,220,200,0.4)',
  ];

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 6 + Math.random() * 10;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
      border-radius: ${Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%'};
    `;
    container.appendChild(p);
  }
})();

// ── Gold Sparkles Generator ──────────────────────────────────
(function createSparkles() {
  const container = document.getElementById('petalsContainer');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle-particle';
    const size = 3 + Math.random() * 5;
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -5vh;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${5 + Math.random() * 7}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(s);
  }
})();

// ── HERO ─ Entrance Animation ────────────────
(function animateHero() {
  // Set initial states for name letters and title pre/quote
  gsap.set('.hero-name-letter', { opacity: 0, y: 30, rotate: -6, scale: 0.9, transformOrigin: 'center center' });
  gsap.set('#heroPreTitle', { opacity: 0, y: 24 });
  gsap.set('#heroQuote', { opacity: 0, y: 24 });

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('#heroPreTitle', {
    opacity: 1, y: 0, duration: 1.1,
    ease: 'power3.out'
  })
    .to('#saveTheDateContainer', {
      opacity: 1, scale: 1, duration: 1.2,
      ease: 'back.out(1.2)'
    }, '-=0.6')
    .to('#heroNames', {
      opacity: 1,
      duration: 0.1
    }, '-=0.7')
    .to('.hero-name-letter', {
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      duration: 1.0,
      stagger: 0.04,
      ease: 'back.out(1.8)'
    }, '-=0.7')
    .to('#heroDivider', {
      opacity: 1, duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')
    .to('#heroDate', {
      opacity: 1, y: 0, duration: 0.9,
      ease: 'power3.out'
    }, '-=0.4')
    .to('#heroQuote', {
      opacity: 1, y: 0, duration: 0.9,
      ease: 'power3.out'
    }, '-=0.5')
    .to('#heroCta', {
      opacity: 1, y: 0, duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    .to('#translateBtn', {
      opacity: 1, y: 0, duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')
    .to('#scrollIndicator', {
      opacity: 1, duration: 1.2,
      ease: 'power2.out'
    }, '-=0.2');

  gsap.fromTo('#heroBgImg',
    { yPercent: 0, scale: 1.12 },
    {
      yPercent: 22,
      scale: 1.28,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    }
  );

  gsap.to('#scrollIndicator', {
    opacity: 0,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '20% top',
      scrub: true,
    }
  });
})();




// 3D Gallery Scroll Animations
(function animate3DGallery() {
  gsap.fromTo('#gallery3dHeader', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#gallery3dHeader',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('.couple-photo-container', {
    scale: 0.94, opacity: 0, y: 30
  }, {
    scale: 1, opacity: 1, y: 0,
    duration: 1.4,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.couple-photo-container',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });
})();

// ═════ SCHEDULE — Scroll Animations ═════
(function animateSchedule() {
  gsap.fromTo('#scheduleHeader', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#scheduleHeader',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#receptionScheduleCard', {
    x: -30, y: 30, opacity: 0
  }, {
    x: 0, y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueScheduleGrid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#weddingScheduleCard', {
    x: 30, y: 30, opacity: 0
  }, {
    x: 0, y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueScheduleGrid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

})();

// ── VENUE ─ Scroll Animations ──────────────────────────────────
(function animateVenue() {
  gsap.fromTo('#venueHeader', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueHeader',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#venueInfoCard', {
    x: -40, y: 30, opacity: 0
  }, {
    x: 0, y: 0, opacity: 1,
    duration: 1.4,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueInfoCard',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

  // 3D perspective flip-and-scale reveal for #venueMapCard
  gsap.fromTo('#venueMapCard', {
    rotationY: -25,
    rotationX: 15,
    scale: 0.9,
    opacity: 0,
    transformPerspective: 1000,
    transformOrigin: "center center"
  }, {
    rotationY: 0,
    rotationX: 0,
    scale: 1,
    opacity: 1,
    duration: 1.5,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueMapCard',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });



  gsap.fromTo('#venueClosing', {
    y: 30, opacity: 0
  }, {
    y: 0, opacity: 1,
    duration: 1.4,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#venueClosing',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });
})();




// ── Resize handler ──────────────────────────────────
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

// ── Subtle star-field in hero bg on mouse move ─────────
(function heroParallax() {
  if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) return;
  const hero = document.getElementById('hero');
  const bgImg = document.getElementById('heroBgImg');
  if (!hero || !bgImg) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(bgImg, {
      x: cx * 18,
      y: cy * 12,
      duration: 1.4,
      ease: 'power2.out',
    });
  });

  hero.addEventListener('mouseleave', () => {
    gsap.to(bgImg, { x: 0, y: 0, duration: 1.5, ease: 'power2.out' });
  });
})();

console.log('💖 Tharun R & Poongodi S — Wedding website loaded. See you on 30.08.2026! 🎉');

// ── 3D Tilt — cards & frames respond to pointer position ────────────
(function init3DTilt() {
  if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) return;
  const tiltEls = document.querySelectorAll(
    '.person-photo-frame, .person-card, .venue-schedule-card, .couple-photo-frame-new, .tl-card'
  );

  tiltEls.forEach((el) => {
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    const quickX = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const quickY = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const quickLiftZ = gsap.quickTo(el, 'z', { duration: 0.6, ease: 'power3.out' });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(px * 9);
      quickY(py * -9);
      quickLiftZ(18);
    });

    el.addEventListener('mouseleave', () => {
      quickX(0);
      quickY(0);
      quickLiftZ(0);
    });
  });

  // Give parent containers perspective so the tilt reads as true 3D
  document.querySelectorAll('.hero, .person-container, .venue-grid, .venue-schedule-grid, .couple-photo-container').forEach(el => {
    el.style.perspective = '1400px';
  });
})();

// ── Floating bokeh light orbs in the hero — extra depth layer ───────
(function createBokehOrbs() {
  const container = document.getElementById('petalsContainer');
  if (!container) return;
  for (let i = 0; i < 10; i++) {
    const o = document.createElement('div');
    o.className = 'bokeh-orb';
    const size = 40 + Math.random() * 90;
    o.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${9 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 6}s;
    `;
    container.appendChild(o);
  }
})();

// ══════════════════════════════════════════════════════════════════════════
//      LANGUAGE TRANSLATION SYSTEM (ENGLISH & TAMIL)
// ══════════════════════════════════════════════════════════════════════════
const translations = {
  en: {
    heroPreTitle: "Together Forever",
    heroQuote: '"In all the world, there is no heart for me like yours.<br />In all the world, there is no love for you like mine."',
    heroGroom: "Tharun R",
    heroBride: "Poongodi S",
    heroCta: "Begin the Journey",
    translateBtn: "🌐 Translate (தமிழ்)",
    scratchDate: "30 Aug 2026",
    scratchDay: "Reception: 29th Aug, 6 PM Onwards",
    scratchTime: "Wedding: 30th Aug, 8 AM Onwards",
    groomQuote: '"In her smile, I see something more beautiful than the stars."',
    groomBio1: "Born and raised in the beautiful city of Salem, Tharun grew up with a deep love for technology, logic, and mechanics. A Senior Cloud Operations Engineer at ZOHO by profession, he graduated with a degree in Mechanical Engineering from Dhirajlal Gandhi College of Technology, Omalur, believing that every great system is built on a foundation of precision and dedication.",
    groomBio2: "He met Poongodi on a memorable evening and instantly knew she was the missing chapter of his story.",
    groomProfLabel: "Profession",
    groomProfVal: "Senior Cloud Operations Engineer at ZOHO",
    groomHomeLabel: "Hometown",
    groomHomeVal: "Salem, Tamil Nadu",
    groomEduLabel: "Education",
    groomEduVal: "B.E MECH<br>Dhirajlal Gandhi College of Technology, Omalur",
    brideQuote: '"I have found the one whom my soul loves."',
    brideBio1: "Born and raised in the beautiful city of Salem, Poongodi is a passionate technology enthusiast who finds joy in software systems and engineering. A DevOps Developer at ZOHO by profession, she graduated with a degree in Computer Science Engineering from Bannari Amman Institute of Technology, Sathyamangalam, blending analytical problem-solving with expressiveness and dedication.",
    brideBio2: "She found a kindred soul in Tharun, whose warmth, intellect, and coding spirit matched her dreams perfectly.",
    brideProfLabel: "Profession",
    brideProfVal: "Devops Developer at ZOHO",
    brideHomeLabel: "Hometown",
    brideHomeVal: "Salem, Tamil Nadu",
    brideEduLabel: "Education",
    brideEduVal: "B.E CSE<br>Bannari Amman Institute of Technology, Sathyamangalam",
    closingScript: "With love & joy,",
    closingNames: "Tharun R & Poongodi S",
    closingNote: "We look forward to celebrating this beautiful milestone with you.<br />Your presence is our greatest gift. 🙏",
    schedulePre: "Celebrate With Us",
    scheduleTitle: "Wedding Details",
    receptionTitle: "✨ Wedding Reception",
    receptionTime: "Saturday, 29.08.2026 · 6:00 PM Onwards",
    weddingTitle: "💍 The Wedding (Muhurtham)",
    weddingTime: "Sunday, 30.08.2026 · 8:00 AM Onwards",
    addToCalendar: "📅 Add to Calendar",
    flamesPre: "Cosmic Match",
    flamesTitle: "Love Destiny",
    flamesSubtitle: "Witness the cosmic bond being calculated — the good old F.L.A.M.E.S. way.",
    flamesGroomLabel: "Groom",
    flamesBrideLabel: "Bride",
    flamesCoupleHint: "Tap reveal to let FLAMES decide.",
    flamesCoupleBtn: "Reveal Destiny",
    flamesTryYourself: "Try It Yourself",
    flamesUserIntro: "Curious about your own destiny? Enter any two names below to calculate.",
    flamesUserBtn: "Find FLAMES Destiny",
    flamesDestinySays: "Destiny says…",
    flamesInputPlaceholderA: "Enter First Name",
    flamesInputPlaceholderB: "Enter Second Name",
    flamesResult_F_word: "Friends",
    flamesResult_F_desc: "Best friends forever — a bond built on trust, laughter and always having each other's back.",
    flamesResult_L_word: "Love",
    flamesResult_L_desc: "True love — two hearts destined to beat as one.",
    flamesResult_A_word: "Affection",
    flamesResult_A_desc: "A warm, gentle affection blossoms between you two.",
    flamesResult_M_word: "Marriage",
    flamesResult_M_desc: "Marriage material — a match written in the stars.",
    flamesResult_E_word: "Enemies",
    flamesResult_E_desc: "Sparks fly… just maybe not the romantic kind! 😄",
    flamesResult_S_word: "Siblings",
    flamesResult_S_desc: "A sibling-style bond — caring, close and a little chaotic.",
    venuePre: "Location & Map",
    venueTitle: "The Venue",
    venueName: "📍 Sri Vaitheeswara Mahal",
    venueType: "Marriage Hall",
    venueAddress: "No: 6/89, Sathiamangalam,<br />Kullampatty (P.O), Valasaiyur,<br />Salem - 636103, Tamil Nadu",
    venueDirections: "🚗 Get Directions",
    footerText: "Created with <span class=\"footer-heart\">♥</span> by Naveenkumar and team · 30.08.2026"
  },
  ta: {
    heroPreTitle: "என்றென்றும் இணைந்து",
    heroQuote: '"விண்ணிலும் மண்ணிலும் உன்னை விட எனக்கேற்ற இதயம் வேறில்லை.<br />உன்னை விட என் அன்பை ஆளும் உயிர் வேறில்லை."',
    heroGroom: "தருண் R",
    heroBride: "பூங்கொடி S",
    heroCta: "பயணத்தை தொடங்குங்கள்",
    translateBtn: "🌐 Translate (English)",
    scratchDate: "30 ஆகஸ்ட் 2026",
    scratchDay: "வரவேற்பு: 29 ஆகஸ்ட், மாலை 6 மணி முதல்",
    scratchTime: "திருமணம்: 30 ஆகஸ்ட், காலை 8 மணி முதல்",
    groomQuote: '"அவளது புன்னகையில், விண்மீன்களை விடவும் பேரழகான ஒன்றைக் காண்கிறேன்."',
    groomBio1: "சேலம் மாநகரில் பிறந்து வளர்ந்த தருண், தொழில்நுட்பம், கணிதம் மற்றும் இயக்கவியலில் மிகுந்த ஆர்வம் கொண்டவர். சோஹோ (ZOHO) நிறுவனத்தில் சீனியர் கிளவுட் ஆபรอง்ஸ் பொறியாளராகப் பணிபுரியும் இவர், ஓமலூர் தீரஜ்லால் காந்தி தொழில்நுட்பக் கல்லூரியில் இயந்திரவியல் பொறியியல் பட்டம் பெற்றுள்ளார், எந்தவொரு சிறந்த அமைப்பும் அர்ப்பணிப்பு மற்றும் துல்லியத்தின் அடிப்படையில் கட்டமைக்கப்படுகிறது என்று நம்புகிறார்.",
    groomBio2: "அவர் பூங்கொடியைச் சந்தித்த தருணத்தில், அவள் தன் வாழ்க்கைப் புத்தகத்தின் தேடப்பட்ட இறுதிப் பக்கம் என்பதை உணர்ந்தார்.",
    groomProfLabel: "பணி",
    groomProfVal: "சோஹோ நிறுவனத்தில் சீனியர் கிளவுட் ஆபரேஷன்ஸ் பொறியாளர்",
    groomHomeLabel: "சொந்த ஊர்",
    groomHomeVal: "சேலம், தமிழ்நாடு",
    groomEduLabel: "கல்வி",
    groomEduVal: "B.E MECH<br>தீரஜ்லால் காந்தி தொழில்நுட்பக் கல்லூரி, ஓமலூர்",
    brideQuote: '"என் உயிர் தேடிய உன்னத அன்பை உன்னில் கண்டடைந்தேன்."',
    brideBio1: "சேலம் மாநகரில் பிறந்து வளர்ந்த பூங்கொடி, கணினி அறிவியல் மற்றும் மென்பொருள் கட்டமைப்புகளில் ஆர்வம் கொண்டவர். சோஹோ (ZOHO) நிறுவனத்தில் டெவொப்ஸ் டெவலப்பராகப் பணிபுரியும் இவர், சத்தியமங்கலம் பன்னாரி அம்மன் தொழில்நுட்ப நிறுவனத்தில் கணினி அறிவியல் பொறியியல் பட்டம் பெற்றுள்ளார், பகுப்பாய்வு சிக்கல் தீர்க்கும் திறனை அர்ப்பணிப்புடன் கலக்கிறார்.",
    brideBio2: "அவள் தருணிடம் தன் கனவுகளுக்கு ஏற்ற அன்பையும், அறிவையும், நேர்மையையும் கண்டடைந்தாள்.",
    brideProfLabel: "பணி",
    brideProfVal: "சோஹோ நிறுவனத்தில் டெவொப்ஸ் டெவலப்பர்",
    brideHomeLabel: "சொந்த ஊர்",
    brideHomeVal: "சேலம், தமிழ்நாடு",
    brideEduLabel: "கல்வி",
    brideEduVal: "B.E CSE<br>பன்னாரி அம்மன் தொழில்நுட்ப நிறுவனம், சத்தியமங்கலம்",
    closingScript: "அன்புடனும் மகிழ்ச்சியுடனும்,",
    closingNames: "தருண் R & பூங்கொடி S",
    closingNote: "இந்த அழகான தருணத்தைக் கொண்டாட உங்களை மகிழ்ச்சியோடு எதிர்நோக்குகிறோம்.<br />உங்கள் வருகையே எங்களுக்கு மிகப்பெரிய ஆசீர்வாதம். 🙏",
    schedulePre: "எங்களுடன் கொண்டாடுங்கள்",
    scheduleTitle: "திருமண விவரங்கள்",
    receptionTitle: "✨ திருமண வரவேற்பு",
    receptionTime: "சனிக்கிழமை, 29.08.2026 · மாலை 6:00 மணி முதல்",
    weddingTitle: "💍 திருமணம் (முகூர்த்தம்)",
    weddingTime: "ஞாயிற்றுக்கிழமை, 30.08.2026 · காலை 8:00 மணி முதல்",
    addToCalendar: "📅 காலண்டரில் சேர்க்கவும்",
    flamesPre: "பிரபஞ்ச பொருத்தம்",
    flamesTitle: "காதல் விதி",
    flamesSubtitle: "பிரபஞ்ச பிணைப்பு எவ்வாறு கணக்கிடப்படுகிறது என்பதைப் பாருங்கள் — பாரம்பரிய F.L.A.M.E.S. முறையில்.",
    flamesGroomLabel: "மணமகன்",
    flamesBrideLabel: "மணமகள்",
    flamesCoupleHint: "விதியை வெளிப்படுத்த பொத்தானை அழுத்தவும்.",
    flamesCoupleBtn: "விதியை வெளிப்படுத்துக",
    flamesTryYourself: "நீங்களும் முயன்று பாருங்கள்",
    flamesUserIntro: "உங்கள் சொந்த விதியைப் பற்றி அறிய ஆவலா? கணக்கிட கீழே ஏதேனும் இரு பெயர்களை உள்ளிடவும்.",
    flamesUserBtn: "F.L.A.M.E.S. விதியை கண்டறி",
    flamesDestinySays: "விதி கூறுவது...",
    flamesInputPlaceholderA: "முதல் பெயரை உள்ளிடவும்",
    flamesInputPlaceholderB: "இரண்டாம் பெயரை உள்ளிடவும்",
    flamesResult_F_word: "நண்பர்கள்",
    flamesResult_F_desc: "என்றென்றும் சிறந்த நண்பர்கள் — நம்பிக்கை, சிரிப்பு மற்றும் எப்போதும் ஒருவருக்கொருவர் துணையாக இருக்கும் பிணைப்பு.",
    flamesResult_L_word: "காதல்",
    flamesResult_L_desc: "உண்மையான காதல் — ஒன்றாக இணைந்த இரு இதயங்கள்.",
    flamesResult_A_word: "அன்பு",
    flamesResult_A_desc: "உங்களுக்கு இடையே ஒரு அன்பான, மென்மையான பாசம் மலர்கிறது.",
    flamesResult_M_word: "திருமணம்",
    flamesResult_M_desc: "திருமண பந்தம் — விண்மீன்களில் எழுதப்பட்ட ஒரு பொருத்தம்.",
    flamesResult_E_word: "எதிரிகள்",
    flamesResult_E_desc: "நெருப்பு பொறிகள் பறக்கின்றன... ஆனால் அது காதல் அல்ல! 😄",
    flamesResult_S_word: "சகோதரர்கள்",
    flamesResult_S_desc: "ஒரு சகோதர பிணைப்பு — கனிவான, நெருக்கமான மற்றும் சற்றே குறும்புத்தனமான உறவு.",
    venuePre: "இடம் & வரைபடம்",
    venueTitle: "திருமண மண்டபம்",
    venueName: "📍 ஸ்ரீ வைத்தீஸ்வர மஹால்",
    venueType: "திருமண மண்டபம்",
    venueAddress: "எண்: 6/89, சத்தியமங்கலம்,<br />குள்ளம்பட்டி (P.O), வலசையூர்,<br />சேலம் - 636103, தமிழ்நாடு",
    venueDirections: "🚗 வழியைக் காட்டு",
    footerText: "நவீன்குமார் மற்றும் குழுவினரால் அன்புடன் <span class=\"footer-heart\">♥</span>-உடன் உருவாக்கப்பட்டது · 30.08.2026"
  }
};

function renderHeroNameLetters() {
  const groomName = document.querySelector('.hero-name-groom');
  const brideName = document.querySelector('.hero-name-bride');
  const ampersand = document.querySelector('.hero-ampersand');

  const wrapCharacters = (element) => {
    if (!element) return;

    // Clear and extract clean text before wrapping
    const text = element.textContent.trim();
    element.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Use Intl.Segmenter to safely split by user-perceived grapheme clusters (essential for Tamil)
    let characters;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      characters = Array.from(segmenter.segment(text)).map(s => s.segment);
    } else {
      characters = Array.from(text);
    }

    characters.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = char === ' ' ? 'hero-name-letter hero-name-space' : 'hero-name-letter';
      span.style.setProperty('--char-index', index);
      span.textContent = char === ' ' ? '\u00A0' : char;
      fragment.appendChild(span);
    });

    element.appendChild(fragment);
  };

  wrapCharacters(groomName);
  wrapCharacters(brideName);

  if (ampersand) {
    ampersand.innerHTML = '';
    const ampSpan = document.createElement('span');
    ampSpan.className = 'hero-name-letter';
    ampSpan.style.setProperty('--char-index', 0);
    ampSpan.textContent = '&';
    ampersand.appendChild(ampSpan);
  }
}

(function initHeroNameAnimation() {
  renderHeroNameLetters();
})();

(function initTranslation() {
  const translateBtn = document.getElementById('translateBtn');
  if (!translateBtn) return;

  let currentLang = 'en';
  document.documentElement.lang = currentLang;

  translateBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    document.documentElement.lang = currentLang;

    // Satisfying 3D coin-flip transition for the translate button
    gsap.fromTo(translateBtn,
      { rotationY: 0 },
      { rotationY: 360, duration: 0.6, ease: 'power2.out', clearProps: 'rotationY' }
    );

    // Animate transition using GSAP for a elegant effect
    gsap.to('[data-translate]', {
      opacity: 0,
      y: -5,
      duration: 0.15,
      stagger: 0.02,
      onComplete: () => {
        // Swap text
        document.querySelectorAll('[data-translate]').forEach(el => {
          const key = el.getAttribute('data-translate');
          if (translations[currentLang][key]) {
            if (el.tagName === 'INPUT') {
              el.placeholder = translations[currentLang][key];
            } else {
              el.innerHTML = translations[currentLang][key];
            }
          }
        });

        renderHeroNameLetters();

        // Fade in
        gsap.to('[data-translate]', {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.02
        });
      }
    });

    // Update scratch canvas text if it hasn't been scratched off
    const scratchCanvas = document.getElementById('scratchCanvas');
    if (scratchCanvas && scratchCanvas.style.display !== 'none') {
      const ctx = scratchCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);

        // Redraw cover gradient
        const gradient = ctx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
        gradient.addColorStop(0, '#7c5c14');
        gradient.addColorStop(0.3, '#d8b65a');
        gradient.addColorStop(0.55, '#fdf0c8');
        gradient.addColorStop(0.8, '#c99a35');
        gradient.addColorStop(1, '#7c5c14');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        for (let i = -scratchCanvas.height; i < scratchCanvas.width; i += 10) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + scratchCanvas.height, scratchCanvas.height);
          ctx.stroke();
        }

        ctx.fillStyle = '#241c0d';
        ctx.font = '600 17px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelText = currentLang === 'en' ? '♥  SCRATCH TO REVEAL  ♥' : '♥  இங்கு சுரண்டவும்  ♥';
        ctx.fillText(labelText, scratchCanvas.width / 2, scratchCanvas.height / 2 - 6);
        ctx.font = '400 11px "Montserrat", sans-serif';
        const subText = currentLang === 'en' ? 'OUR WEDDING DATE' : 'எங்கள் திருமண தேதி';
        ctx.fillText(subText, scratchCanvas.width / 2, scratchCanvas.height / 2 + 18);
      }
    }
  });
  console.log('🌐 Translation system initialized. Language toggling enabled.');
})();
// ══════════════════════════════════════════════════════════════════════════
// LOVE DESTINY — FLAMES GAME ENGINE
// ══════════════════════════════════════════════════════════════════════════
(function initFlames() {

  const FLAMES_MAP = {
    F: { word: 'Friends', desc: 'Best friends forever — a bond built on trust, laughter and always having each other\u2019s back.' },
    L: { word: 'Love', desc: 'True love — two hearts destined to beat as one.' },
    A: { word: 'Affection', desc: 'A warm, gentle affection blossoms between you two.' },
    M: { word: 'Marriage', desc: 'Marriage material — a match written in the stars.' },
    E: { word: 'Enemies', desc: 'Sparks fly\u2026 just maybe not the romantic kind! \uD83D\uDE04' },
    S: { word: 'Siblings', desc: 'A sibling-style bond — caring, close and a little chaotic.' }
  };

  // ── Destiny Blast — full-screen love-themed celebration ──
  // Dedicated confetti canvas, created once and pinned above every other
  // fixed element on the page (music widget, cursor glow, etc).
  let destinyConfetti = null;
  let destinyHeartShape = null;
  function getDestinyConfetti() {
    if (destinyConfetti || typeof confetti !== 'function') return destinyConfetti;
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'destinyBlastCanvas';
    canvasEl.style.position = 'fixed';
    canvasEl.style.inset = '0';
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.zIndex = '10009';
    canvasEl.style.pointerEvents = 'none';
    document.body.appendChild(canvasEl);
    destinyConfetti = confetti.create(canvasEl, { resize: true, useWorker: true });
    if (confetti.shapeFromPath) {
      destinyHeartShape = confetti.shapeFromPath({
        path: 'M167 72c19,-38 45,-52 76,-52 42,0 76,33 76,75 0,66 -76,141 -152,177 -76,-36 -152,-111 -152,-177 0,-42 34,-75 76,-75 31,0 57,14 76,52z',
      });
    }
    return destinyConfetti;
  }

  // Spawns a shower of floating hearts drifting up the full screen — a
  // soft, romantic full-screen "blast" that suits the wedding theme.
  function spawnFloatingHearts(count) {
    const layer = document.createElement('div');
    layer.className = 'destiny-heart-layer';
    document.body.appendChild(layer);

    const glyphs = ['♥', '💗', '💛'];
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'destiny-heart';
      heart.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const size = 1.1 + Math.random() * 1.9;
      const duration = 2.6 + Math.random() * 2.2;
      const delay = Math.random() * 0.6;
      const drift = (Math.random() * 2 - 1) * 90;
      heart.style.left = (Math.random() * 100) + 'vw';
      heart.style.fontSize = size + 'rem';
      heart.style.setProperty('--drift', drift + 'px');
      heart.style.animationDuration = duration + 's';
      heart.style.animationDelay = delay + 's';
      layer.appendChild(heart);
    }

    window.setTimeout(() => layer.remove(), 5200);
  }

  // Fires the full-screen love-themed celebration: a warm flash, a shower
  // of floating hearts, and heart-shaped confetti. `intensity` scales it.
  function triggerDestinyBlast(intensity) {
    const isGrand = intensity === 'grand';

    // Full-screen warm flash
    const flash = document.createElement('div');
    flash.className = 'destiny-blast-flash';
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('is-active'));
    window.setTimeout(() => flash.remove(), 1000);

    // Floating heart shower
    spawnFloatingHearts(isGrand ? 34 : 18);

    // Heart-shaped confetti burst in the site's rose-gold palette
    const fire = getDestinyConfetti();
    if (fire) {
      const themeColors = ['#f6c453', '#fdf0c8', '#e88fa3', '#ffffff', '#c99a35', '#b25a72'];
      const shapes = destinyHeartShape ? [destinyHeartShape, 'circle'] : ['circle'];

      fire({
        particleCount: isGrand ? 90 : 50,
        spread: isGrand ? 110 : 85,
        startVelocity: isGrand ? 48 : 36,
        origin: { y: 0.5 },
        colors: themeColors,
        shapes,
        scalar: isGrand ? 1.3 : 1.1,
        ticks: 280,
      });

      window.setTimeout(() => {
        fire({
          particleCount: isGrand ? 40 : 20,
          angle: 60,
          spread: 70,
          startVelocity: 42,
          origin: { x: 0, y: 0.65 },
          colors: themeColors,
          shapes,
          scalar: 1.1,
        });
        fire({
          particleCount: isGrand ? 40 : 20,
          angle: 120,
          spread: 70,
          startVelocity: 42,
          origin: { x: 1, y: 0.65 },
          colors: themeColors,
          shapes,
          scalar: 1.1,
        });
      }, 180);

      if (isGrand) {
        window.setTimeout(() => {
          fire({
            particleCount: 60,
            spread: 130,
            startVelocity: 50,
            origin: { y: 0.35 },
            colors: themeColors,
            shapes,
            scalar: 1.2,
          });
        }, 380);
      }
    }
  }

  function normalizeName(str) {
    return (str || '').toUpperCase().replace(/[^A-Z]/g, '');
  }

  function checkIfCouple(nameA, nameB) {
    const nA = normalizeName(nameA);
    const nB = normalizeName(nameB);
    return (
      (nA.includes('THARUN') && nB.includes('POONGODI')) ||
      (nB.includes('THARUN') && nA.includes('POONGODI'))
    );
  }

  // Cancels the first matching occurrence of each shared letter between two names
  function flamesCancel(nameA, nameB) {
    const a = normalizeName(nameA).split('');
    const b = normalizeName(nameB).split('');
    const aCanceled = new Array(a.length).fill(false);
    const bCanceled = new Array(b.length).fill(false);

    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        if (!bCanceled[j] && !aCanceled[i] && a[i] === b[j]) {
          aCanceled[i] = true;
          bCanceled[j] = true;
          break;
        }
      }
    }

    const remaining = aCanceled.filter(v => !v).length + bCanceled.filter(v => !v).length;
    return { a, b, aCanceled, bCanceled, remaining };
  }

  // Classic FLAMES elimination (Josephus-style counting through F-L-A-M-E-S)
  function solveFlames(count) {
    if (count <= 0) return 'L'; // identical / fully-cancelled names -> treat as a perfect match
    let letters = ['F', 'L', 'A', 'M', 'E', 'S'];
    let idx = 0;
    while (letters.length > 1) {
      idx = (idx + count - 1) % letters.length;
      letters.splice(idx, 1);
    }
    return letters[0];
  }

  function buildLetterRow(container, letters, canceledFlags) {
    container.innerHTML = '';
    letters.forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'flames-letter';
      span.textContent = ch;
      if (canceledFlags[i]) span.dataset.canceled = 'true';
      container.appendChild(span);
    });
  }

  function buildWordRow(container) {
    container.innerHTML = '';
    ['F', 'L', 'A', 'M', 'E', 'S'].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'flames-word-letter';
      span.textContent = ch;
      span.dataset.letter = ch;
      container.appendChild(span);
    });
  }

  // Runs the full reveal sequence: strike out shared letters, then eliminate
  // FLAMES letters one-by-one down to the winner.
  function runFlamesReveal(opts) {
    const {
      btn, hintEl, rowAEl, rowBEl, resultEl, wordRowEl, resultWordEl, resultDescEl,
      nameA, nameB, blast
    } = opts;

    const currentLang = document.documentElement.lang || 'en';
    const { a, b, aCanceled, bCanceled, remaining } = flamesCancel(nameA, nameB);

    if (a.length === 0 || b.length === 0) {
      if (hintEl) {
        hintEl.textContent = currentLang === 'en' ? 'Please enter a valid name using letters.' : 'தயவுசெய்து எழுத்துக்களைப் பயன்படுத்தி செல்லுபடியாகும் பெயரை உள்ளிடவும்.';
      }
      return;
    }

    const isCoupleMatch = checkIfCouple(nameA, nameB);

    btn.disabled = true;
    resultEl.classList.remove('is-visible');
    resultWordEl.textContent = '';
    resultDescEl.textContent = '';

    buildLetterRow(rowAEl, a, new Array(a.length).fill(false));
    buildLetterRow(rowBEl, b, new Array(b.length).fill(false));
    buildWordRow(wordRowEl);

    if (hintEl) {
      hintEl.textContent = currentLang === 'en' ? 'Crossing out the shared letters...' : 'இரு பெயர்களிலும் உள்ள பொதுவான எழுத்துக்களை நீக்குகிறது...';
    }

    const tl = gsap.timeline({
      onComplete: () => { btn.disabled = false; }
    });

    // Stagger-cancel shared letters across both rows
    const aSpans = rowAEl.querySelectorAll('.flames-letter');
    const bSpans = rowBEl.querySelectorAll('.flames-letter');
    let cancelDelay = 0.15;

    aCanceled.forEach((canceled, i) => {
      if (canceled) {
        tl.add(() => aSpans[i].classList.add('is-canceled'), cancelDelay);
        cancelDelay += 0.12;
      }
    });
    bCanceled.forEach((canceled, i) => {
      if (canceled) {
        tl.add(() => bSpans[i].classList.add('is-canceled'), cancelDelay);
        cancelDelay += 0.12;
      }
    });

    tl.add(() => {
      if (hintEl) {
        hintEl.textContent = currentLang === 'en'
          ? 'The stars are counting… (' + remaining + ' letters remain)'
          : 'நட்சத்திரங்கள் கணக்கிடுகின்றன… (' + remaining + ' எழுத்துக்கள் மீதமுள்ளன)';
      }
    }, cancelDelay + 0.2);

    // Eliminate FLAMES letters one at a time, mirroring the real algorithm
    const finalLetter = isCoupleMatch ? 'M' : solveFlames(remaining);
    let letters = ['F', 'L', 'A', 'M', 'E', 'S'];
    let idx = 0;
    let stepTime = cancelDelay + 0.9;
    const wordSpans = () => wordRowEl.querySelectorAll('.flames-word-letter');

    if (isCoupleMatch) {
      const toRemove = ['F', 'L', 'A', 'E', 'S'];
      toRemove.forEach((letterToRemove, stepIdx) => {
        tl.add(() => {
          const spans = wordSpans();
          spans.forEach(s => {
            if (s.dataset.letter === letterToRemove && !s.classList.contains('is-out')) {
              s.classList.add('is-out');
            }
          });
        }, stepTime + stepIdx * 0.5);
      });
      stepTime += toRemove.length * 0.5;
    } else {
      while (letters.length > 1) {
        idx = (idx + remaining - 1) % letters.length;
        const letterToRemove = letters[idx];
        tl.add(() => {
          const spans = wordSpans();
          spans.forEach(s => {
            if (s.dataset.letter === letterToRemove && !s.classList.contains('is-out')) {
              s.classList.add('is-out');
            }
          });
        }, stepTime);
        letters.splice(idx, 1);
        stepTime += 0.5;
      }
    }

    tl.add(() => {
      const spans = wordSpans();
      spans.forEach(s => {
        if (s.dataset.letter === finalLetter) s.classList.add('is-winner');
      });

      const wordKey = `flamesResult_${finalLetter}_word`;
      const descKey = `flamesResult_${finalLetter}_desc`;

      resultWordEl.setAttribute('data-translate', wordKey);
      resultDescEl.setAttribute('data-translate', descKey);

      resultWordEl.textContent = translations[currentLang][wordKey] || (FLAMES_MAP[finalLetter] || FLAMES_MAP.L).word;
      resultDescEl.textContent = translations[currentLang][descKey] || (FLAMES_MAP[finalLetter] || FLAMES_MAP.L).desc;
      resultEl.classList.add('is-visible');
      if (hintEl) {
        if (btn && btn.style.display === 'none') {
          hintEl.style.display = 'none';
        } else {
          hintEl.textContent = currentLang === 'en' ? 'Tap reveal to try again.' : 'மீண்டும் முயல பொத்தானை அழுத்தவும்.';
        }
      }
      if (blast) triggerDestinyBlast(blast);
    }, stepTime + 0.3);
  }


  // ── Couple's default FLAMES card ─────────────────────────
  function initCoupleCard() {
    const card = document.getElementById('flamesCoupleCard');
    if (!card) return;

    const groomName = document.querySelector('#flamesCoupleCard .flames-name-block:first-child .flames-name-value')?.textContent || 'Tharun R';
    const brideName = document.querySelector('#flamesCoupleCard .flames-name-block:last-child .flames-name-value')?.textContent || 'Poongodi S';

    const rowAEl = document.getElementById('flamesCoupleRowA');
    const rowBEl = document.getElementById('flamesCoupleRowB');
    const btn = document.getElementById('flamesCoupleBtn');
    const hintEl = document.getElementById('flamesCoupleHint');
    const resultEl = document.getElementById('flamesCoupleResult');
    const wordRowEl = document.getElementById('flamesCoupleWordRow');
    const resultWordEl = document.getElementById('flamesCoupleResultWord');
    const resultDescEl = document.getElementById('flamesCoupleResultDesc');

    // Initial static letter display (no cancellations yet)
    const groomLetters = normalizeName(groomName).split('');
    const brideLetters = normalizeName(brideName).split('');
    buildLetterRow(rowAEl, groomLetters, new Array(groomLetters.length).fill(false));
    buildLetterRow(rowBEl, brideLetters, new Array(brideLetters.length).fill(false));

    btn.addEventListener('click', () => {
      btn.style.display = 'none';
      runFlamesReveal({
        btn, hintEl, rowAEl, rowBEl, resultEl, wordRowEl, resultWordEl, resultDescEl,
        nameA: groomName, nameB: brideName, blast: 'grand'
      });
    });
  }

  // ── User's own FLAMES card ────────────────────────────────
  function initUserCard() {
    const card = document.getElementById('flamesUserCard');
    if (!card) return;

    const inputA = document.getElementById('flamesUserInputA');
    const inputB = document.getElementById('flamesUserInputB');
    const btn = document.getElementById('flamesUserBtn');
    const errorEl = document.getElementById('flamesUserError');
    const lettersGrid = document.getElementById('flamesUserLettersGrid');
    const rowAEl = document.getElementById('flamesUserRowA');
    const rowBEl = document.getElementById('flamesUserRowB');

    const resultEl = document.getElementById('flamesUserResult');
    const wordRowEl = document.getElementById('flamesUserWordRow');
    const resultWordEl = document.getElementById('flamesUserResultWord');
    const resultDescEl = document.getElementById('flamesUserResultDesc');

    function handleFind() {
      const nameA = (inputA.value || '').trim();
      const nameB = (inputB.value || '').trim();
      errorEl.textContent = '';

      if (!normalizeName(nameA)) {
        errorEl.textContent = 'Please type the first name 💖';
        inputA.focus();
        return;
      }
      if (!normalizeName(nameB)) {
        errorEl.textContent = 'Please type the second name 💖';
        inputB.focus();
        return;
      }

      lettersGrid.hidden = false;

      runFlamesReveal({
        btn, hintEl: errorEl, rowAEl, rowBEl, resultEl, wordRowEl, resultWordEl, resultDescEl,
        nameA: nameA, nameB: nameB
      });
    }

    btn.addEventListener('click', handleFind);
    [inputA, inputB].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleFind();
        }
      });
    });
  }

  initCoupleCard();
  initUserCard();

})();

// ── FLAMES — Scroll Reveal Animations ────────────────────
(function animateFlames() {
  if (!document.getElementById('flamesHeader')) return;

  gsap.fromTo('#flamesHeader', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#flamesHeader',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#flamesCoupleCard', {
    y: 40, opacity: 0, scale: 0.96
  }, {
    y: 0, opacity: 1, scale: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#flamesCoupleCard',
      start: 'top 82%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#flamesUserCard', {
    y: 40, opacity: 0, scale: 0.96
  }, {
    y: 0, opacity: 1, scale: 1,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#flamesUserCard',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });
})();
