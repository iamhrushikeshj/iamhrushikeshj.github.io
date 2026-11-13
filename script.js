document.addEventListener("DOMContentLoaded", () => {

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // --- 0. THEME (light / dark) ---
  const THEME_KEY = 'hj_theme';
  const themeToggle = document.getElementById('themeToggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeMedia = window.matchMedia('(prefers-color-scheme: light)');

  const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

  function applyTheme(theme) {
    const light = theme === 'light';
    document.documentElement.setAttribute('data-theme', theme);

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', light ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
    if (themeMeta) themeMeta.setAttribute('content', light ? '#eef2f6' : '#050505');

    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  applyTheme(getTheme()); // sync label / aria / meta with the boot script

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
  }

  // Follow the OS only while the user hasn't picked a mode manually
  const onSchemeChange = (e) => {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (err) {}
    if (!stored) applyTheme(e.matches ? 'light' : 'dark');
  };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', onSchemeChange);
  else if (themeMedia.addListener) themeMedia.addListener(onSchemeChange);

  // --- 1. CUSTOM CURSOR ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (finePointer && cursorDot && cursorOutline) {
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .tab-link');

    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursorOutline.style.width = '60px';
        cursorOutline.style.height = '60px';
        cursorOutline.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
      });
      target.addEventListener('mouseleave', () => {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.backgroundColor = 'transparent';
      });
    });
  }

  // --- 2. TAB SYSTEM ---
  const TAB_ORDER = ['intro', 'about', 'experience', 'internships', 'skills', 'projects', 'contact'];
  const TAB_LABELS = {
    intro: 'Intro',
    about: 'About',
    experience: 'Experience',
    internships: 'Internships',
    skills: 'Skills',
    projects: 'Projects',
    contact: 'Contact'
  };

  const panels = Array.from(document.querySelectorAll('.panel'));
  const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
  const triggerEls = Array.from(document.querySelectorAll('[data-tab]'));

  const pagerPrev = document.getElementById('pagerPrev');
  const pagerNext = document.getElementById('pagerNext');
  const prevName = document.getElementById('prevName');
  const nextName = document.getElementById('nextName');

  let currentTab = 'intro';
  let isSwitching = false;

  const getPanel = (name) => panels.find(p => p.dataset.panel === name) || null;
  const directionOf = (from, to) =>
    TAB_ORDER.indexOf(to) >= TAB_ORDER.indexOf(from) ? 1 : -1;

  function updatePager() {
    const i = TAB_ORDER.indexOf(currentTab);
    const prev = TAB_ORDER[i - 1];
    const next = TAB_ORDER[i + 1];

    if (prev) {
      pagerPrev.hidden = false;
      pagerPrev.dataset.tab = prev;
      pagerPrev.setAttribute('aria-label', `Previous section: ${TAB_LABELS[prev]}`);
      prevName.textContent = TAB_LABELS[prev];
    } else {
      pagerPrev.hidden = true;
      delete pagerPrev.dataset.tab;
    }

    if (next) {
      pagerNext.hidden = false;
      pagerNext.dataset.tab = next;
      pagerNext.setAttribute('aria-label', `Next section: ${TAB_LABELS[next]}`);
      nextName.textContent = TAB_LABELS[next];
    } else {
      pagerNext.hidden = true;
      delete pagerNext.dataset.tab;
    }
  }

  function revealItems(panel) {
    const items = panel.querySelectorAll('.reveal');
    if (!items.length) return;
    gsap.fromTo(items,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }

  function setPanel(name, { scroll = true } = {}) {
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === name));
    tabLinks.forEach(l => {
      const on = l.dataset.tab === name;
      l.classList.toggle('active', on);
      l.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    currentTab = name;
    updatePager();
    if (scroll) window.scrollTo(0, 0);
    if (window.location.hash !== `#${name}`) {
      history.replaceState(null, '', `#${name}`);
    }
  }

  function switchTo(name, mode = 'zoomIn') {
    if (isSwitching || !getPanel(name) || name === currentTab) return;
    const target = getPanel(name);
    const current = getPanel(currentTab);

    if (reduced) {
      current.classList.remove('active');
      setPanel(name);
      revealItems(target);
      return;
    }

    isSwitching = true;
    const isForward = mode === 'zoomIn';
    const outScale = isForward ? 1.9 : 0.55;
    const inScale  = isForward ? 0.82 : 1.22;

    gsap.timeline({ onComplete: () => { isSwitching = false; } })
      .to(current, {
        scale: outScale, opacity: 0, filter: 'blur(6px)',
        transformOrigin: '50% 45%', duration: 0.38, ease: 'power2.in'
      })
      .call(() => {
        gsap.set(current, { clearProps: 'transform,opacity,filter' });
        current.classList.remove('active');
        setPanel(name);
      })
      .fromTo(target,
        { scale: inScale, opacity: 0, filter: 'blur(6px)', transformOrigin: '50% 45%' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity,filter' }
      )
      .add(() => revealItems(target), '-=0.35');
  }

  // Trigger clicks (nav links, logo, etc.)
  triggerEls.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const name = el.dataset.tab;
      const mode = directionOf(currentTab, name) === 1 ? 'zoomIn' : 'zoomOut';
      switchTo(name, mode);
    });
  });

  pagerPrev.addEventListener('click', () => {
    const name = pagerPrev.dataset.tab;
    if (name) switchTo(name, 'zoomOut');
  });
  pagerNext.addEventListener('click', () => {
    const name = pagerNext.dataset.tab;
    if (name) switchTo(name, 'zoomIn');
  });

  // --- 3. KEYBOARD SHORTCUTS ---
  document.addEventListener('keydown', (e) => {
    const inField = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
    if (inField) return;

    // 1-7 → jump tab
    if (e.key >= '1' && e.key <= '7') {
      const idx = parseInt(e.key, 10) - 1;
      if (TAB_ORDER[idx] && TAB_ORDER[idx] !== currentTab) {
        e.preventDefault();
        switchTo(TAB_ORDER[idx], directionOf(currentTab, TAB_ORDER[idx]) === 1 ? 'zoomIn' : 'zoomOut');
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      const next = TAB_ORDER[TAB_ORDER.indexOf(currentTab) + 1];
      if (next) { e.preventDefault(); switchTo(next, 'zoomIn'); }
    } else if (e.key === 'ArrowLeft') {
      const prev = TAB_ORDER[TAB_ORDER.indexOf(currentTab) - 1];
      if (prev) { e.preventDefault(); switchTo(prev, 'zoomOut'); }
    }
  });

  // --- 4. DEEP LINK ---
  const initial = (window.location.hash || '#intro').slice(1);
  const startTab = getPanel(initial) ? initial : 'intro';
  setPanel(startTab, { scroll: false });
  revealItems(getPanel(startTab));

  window.addEventListener('hashchange', () => {
    const name = window.location.hash.slice(1);
    if (getPanel(name) && name !== currentTab) {
      switchTo(name, directionOf(currentTab, name) === 1 ? 'zoomIn' : 'zoomOut');
    }
  });

  // --- 5. BOOT SCREEN ---
  const bootScreen = document.getElementById('bootScreen');
  const bootLog = document.getElementById('bootLog');
  const bootSeen = sessionStorage.getItem('hj_booted') === '1';

  function endBoot() {
    if (!bootScreen || bootScreen.classList.contains('hidden')) return;
    bootScreen.classList.add('hidden');
    sessionStorage.setItem('hj_booted', '1');
    setTimeout(() => bootScreen.remove(), 600);
  }

  if (bootScreen && bootLog && !bootSeen && !reduced) {
    const lines = [
      'booting HJ.SYS v2.7 …',
      'loading kernel modules <span class="ok">[OK]</span>',
      'initializing network stack <span class="ok">[OK]</span>',
      'mounting portfolio filesystem <span class="ok">[OK]</span>',
      'starting webgl renderer <span class="ok">[OK]</span>',
      'all systems nominal — entering shell'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= lines.length) { clearInterval(interval); setTimeout(endBoot, 250); return; }
      const div = document.createElement('div');
      div.className = 'line';
      div.innerHTML = lines[i];
      bootLog.appendChild(div);
      i++;
    }, 160);

    const skip = () => { clearInterval(interval); endBoot(); };
    bootScreen.addEventListener('click', skip);
    document.addEventListener('keydown', skip, { once: true });
  } else if (bootScreen) {
    bootScreen.remove();
  }

  // --- 6. SERVICE WORKER ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // --- 7. THREE.JS BACKGROUND ---
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 700;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  // Soft radial sprite so particles have feathered edges (looks good in both themes)
  const particleSprite = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f3ff,
    map: particleSprite,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // Particle look follows the active theme.
  // Additive blending only works on dark backgrounds — swap to NormalBlending
  // in light mode so the dots actually appear on top of the pale page.
  const applyParticleTheme = (theme) => {
    const light = theme === 'light';
    particlesMaterial.color.set(light ? 0x0087a0 : 0x00f3ff);
    particlesMaterial.opacity = light ? 0.7 : 0.8;
    particlesMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    particlesMaterial.needsUpdate = true;
  };
  applyParticleTheme(getTheme());
  document.addEventListener('themechange', (e) => applyParticleTheme(e.detail.theme));

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  camera.position.z = 5;
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    particlesMesh.rotation.y = t * 0.05;
    particlesMesh.rotation.x = t * 0.02;
    particlesMesh.rotation.y += mouseX * 0.5;
    particlesMesh.rotation.x += mouseY * 0.5;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

});