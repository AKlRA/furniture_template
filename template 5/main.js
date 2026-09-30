(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=78&auto=format&fit=crop`;

  /* =========================================================
     INTRO: a small frame on black grows into the hero
     ========================================================= */
  const intro = document.querySelector('[data-intro]');
  const heroSplit = document.querySelector('.hero .split');
  const ready = () => { root.classList.add('is-ready'); heroSplit.classList.add('is-in'); };
  let seen = false;
  try { seen = sessionStorage.getItem('sm5-intro') === '1'; } catch (e) {}

  if (seen || reduced) {
    root.classList.add('no-intro');
    requestAnimationFrame(() => requestAnimationFrame(ready));
  } else {
    body.classList.add('is-locked');
    const frame = document.createElement('div');
    frame.className = 'intro__img';
    frame.innerHTML = `<img src="${document.querySelector('.hero__media img').src}" alt="" />`;
    intro.prepend(frame);
    const count = intro.querySelector('[data-count]');
    const t0 = performance.now();
    const tick = (t) => {
      const p = clamp((t - t0) / 1100);
      count.textContent = String(Math.round(p * 100)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => intro.classList.add('is-open'), 1250);
    setTimeout(() => {
      intro.classList.add('is-done');
      body.classList.remove('is-locked');
      ready();
      try { sessionStorage.setItem('sm5-intro', '1'); } catch (e) {}
      setTimeout(() => intro.remove(), 400);
    }, 2400);
  }

  /* =========================================================
     REVEALS: headings split up, cut words wipe in
     ========================================================= */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -12% 0px', threshold: 0.2 }
  );
  document.querySelectorAll('.reveal, .split').forEach((el) => { if (el !== heroSplit) io.observe(el); });

  /* =========================================================
     SCROLL-LINKED PROGRESS (only while a section is on screen)
     ========================================================= */
  const vh = () => window.innerHeight;
  const prog = (el) => { const r = el.getBoundingClientRect(); return clamp((vh() - r.top) / (vh() + r.height)); };

  // Wrap each word of the about paragraph so it can light up
  const scrub = document.querySelector('[data-scrub]');
  const wrapWords = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        wrapWords(n);
      }
    });
  };
  wrapWords(scrub);
  const words = [...scrub.querySelectorAll('.w')];

  const hero = document.querySelector('[data-hero]');
  const about = document.querySelector('[data-about]');
  const feature = document.querySelector('[data-feature]');
  const steps = document.querySelector('[data-steps]');
  const stepsRow = document.querySelector('[data-steps-row]');
  const stepItems = [...stepsRow.children];
  const drifters = [...document.querySelectorAll('[data-drift]')];
  const aboutGrow = about.querySelector('[data-grow]');
  const featureGrow = feature.querySelector('[data-grow]');

  const update = () => {
    // Hero: image and giant word drift as it leaves
    const rh = hero.getBoundingClientRect();
    hero.style.setProperty('--hp', clamp(-rh.top / rh.height).toFixed(3));

    // About: words light in reading order, image grows, side images drift
    const pa = prog(about);
    const lit = Math.round(clamp((pa - 0.12) / 0.38) * words.length);
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    aboutGrow.style.setProperty('--g', clamp((pa - 0.25) / 0.35).toFixed(3));
    drifters.forEach((d) => d.style.setProperty('--d', ((pa - 0.5) * 2 * Number(d.dataset.drift)).toFixed(1)));

    // Feature: the piece settles as it reaches the middle
    featureGrow.style.setProperty('--g', clamp((prog(feature) - 0.15) / 0.35).toFixed(3));

    // Steps: dotted line draws, then each step lights
    const ps = clamp((prog(steps) - 0.2) / 0.28);
    stepsRow.style.setProperty('--line', ps.toFixed(3));
    stepItems.forEach((li, i) => li.classList.toggle('is-on', ps >= i / (stepItems.length - 1) - 0.02));
  };

  if (reduced) {
    words.forEach((w) => w.classList.add('is-lit'));
    stepItems.forEach((li) => li.classList.add('is-on'));
    stepsRow.style.setProperty('--line', 1);
    [aboutGrow, featureGrow].forEach((g) => g.style.setProperty('--g', 1));
  } else {
    let queued = false;
    let active = 0;
    const onScroll = () => {
      if (queued || !active) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    };
    // Only listen while at least one animated section is visible
    const gate = new IntersectionObserver((entries) => {
      entries.forEach((e) => { active += e.isIntersecting ? 1 : -1; });
      active = Math.max(0, active);
      if (active) onScroll();
    });
    [hero, about, feature, steps].forEach((s) => gate.observe(s));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* =========================================================
     THE VAULT: switch pieces
     ========================================================= */
  const pieces = [
    { name: 'Heartwood Mala', no: 3, img: '1784570343031-649cce9a185c', alt: 'Red-brown sandalwood mala with silver accents' },
    { name: 'Carved Objects', no: 7, img: '1767043088777-1884c2ef6c97', alt: 'Hand-carved red sandalwood objects' },
    { name: 'Wide-Tooth Comb', no: 12, img: '1774301844178-c9ce96b76d92', alt: 'A carved wooden comb' },
    { name: 'Keepsake Box', no: 18, img: '1770816307472-945144576a1f', alt: 'An open wooden keepsake box in a pool of light' },
  ];
  const vImgWrap = document.querySelector('.vault__img');
  const vImg = document.querySelector('[data-vault-img]');
  const vName = document.querySelector('[data-vault-name]');
  const vNo = document.querySelector('[data-vault-no]');
  const thumbs = [...document.querySelectorAll('[data-thumbs] button')];
  let vCur = 0;
  const countTo = (from, to) => {
    if (reduced) { vNo.textContent = String(to).padStart(2, '0'); return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / 600);
      const e = 1 - Math.pow(1 - p, 3);
      vNo.textContent = String(Math.round(from + (to - from) * e)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  thumbs.forEach((b, i) => b.addEventListener('click', () => {
    if (i === vCur) return;
    const prev = pieces[vCur];
    vCur = i;
    thumbs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
    vImgWrap.classList.add('is-swapping');
    setTimeout(() => {
      vImg.src = U(pieces[i].img, 1000);
      vImg.alt = pieces[i].alt;
      vName.textContent = pieces[i].name;
      vImgWrap.classList.remove('is-swapping');
    }, 300);
    countTo(prev.no, pieces[i].no);
  }));

  /* =========================================================
     VOICES: workshop notes carousel
     ========================================================= */
  const notes = [
    { text: 'The wood decides what it will become. The hand follows.', by: 'On carving', img: '1779031242469-ef2e794987b0' },
    { text: 'Every piece begins as a reading. The grain is studied before the first cut.', by: 'On selection', img: '1606077089563-cff5a4f3d3d9' },
    { text: 'All pieces are individually numbered and registered. The record travels with the piece.', by: 'On provenance', img: '1778616364918-34490657598f' },
    { text: 'The wood was sourced in 2011. It has been waiting since then for the right hands.', by: 'On the 2011 Vault', img: '1697507695420-04623ccff2af' },
  ];
  const voices = document.querySelector('[data-voices]');
  const vFig = voices.querySelector('[data-v-img]');
  const vText = voices.querySelector('[data-v-text]');
  const vBy = voices.querySelector('[data-v-by]');
  const vQueue = voices.querySelector('[data-v-queue]');
  vFig.innerHTML = notes.map((n, i) => `<img src="${U(n.img, 900)}" alt="" data-n="${i}" loading="lazy" />`).join('');
  const layers = [...vFig.querySelectorAll('img')];
  let nCur = -1;
  const showNote = (i) => {
    const n = notes.length;
    i = (i + n) % n;
    if (i === nCur) return;
    const first = nCur === -1;
    nCur = i;
    layers.forEach((im, k) => { im.style.zIndex = k === i ? 2 : 1; });
    layers[i].classList.remove('is-on');
    void layers[i].offsetWidth;
    layers[i].classList.add('is-on');
    setTimeout(() => layers.forEach((im, k) => { if (k !== i) im.classList.remove('is-on'); }), 900);
    voices.classList.toggle('is-swapping', !first);
    setTimeout(() => {
      vText.textContent = notes[i].text;
      vBy.textContent = notes[i].by;
      voices.classList.remove('is-swapping');
    }, first ? 0 : 300);
    vQueue.innerHTML = [1, 2].map((d) => {
      const k = (i + d) % n;
      return `<button data-go="${k}" aria-label="Show note: ${notes[k].by}"><img src="${U(notes[k].img, 300)}" alt="" /></button>`;
    }).join('');
  };
  vQueue.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) showNote(Number(b.dataset.go)); });
  voices.querySelector('[data-v-next]').addEventListener('click', () => showNote(nCur + 1));
  voices.querySelector('[data-v-prev]').addEventListener('click', () => showNote(nCur - 1));
  showNote(0);

  /* =========================================================
     THEME: light / dark with a circular reveal
     ========================================================= */
  const icon = document.querySelector('[data-theme-icon]');
  const mainToggle = document.querySelector('.nav [data-theme-toggle]');
  const syncIcon = () => {
    const dark = root.dataset.theme === 'dark';
    icon.className = `ph-light ${dark ? 'ph-sun' : 'ph-moon'}`;
    mainToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  syncIcon();
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('sm5-theme', t); } catch (e) {}
    syncIcon();
  };
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', (e) => {
    e.preventDefault();
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const r = btn.getBoundingClientRect();
    root.style.setProperty('--tx', `${r.left + r.width / 2}px`);
    root.style.setProperty('--ty', `${r.top + r.height / 2}px`);
    if (!reduced && document.startViewTransition) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
    setMenu(false);
  }));

  /* =========================================================
     MENU + BAG
     ========================================================= */
  const menu = document.querySelector('[data-menu]');
  const menuBtn = document.querySelector('[data-menu-open]');
  function setMenu(open) {
    root.classList.toggle('is-menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    body.classList.toggle('is-locked', open);
  }
  menuBtn.addEventListener('click', () => setMenu(true));
  document.querySelector('[data-menu-close]').addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a:not([data-theme-toggle])').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const bag = document.querySelector('[data-bag]');
  const setBag = (open) => {
    root.classList.toggle('is-bag-open', open);
    bag.setAttribute('aria-hidden', String(!open));
    if (open) bag.querySelector('[data-bag-close]').focus();
  };
  document.querySelector('[data-bag-open]').addEventListener('click', () => setBag(true));
  document.querySelectorAll('[data-bag-close], [data-scrim]').forEach((el) => el.addEventListener('click', () => setBag(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setBag(false);
    setMenu(false);
  });
})();
