(() => {
  const root = document.documentElement;

  /* Entry reveals */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* Mobile menu */
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const setMenu = (open) => {
    root.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!root.classList.contains('is-menu-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Bag drawer */
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

  /* Hero featured card */
  const features = [
    { kicker: 'Current edition', title: 'The 2011 Vault', img: 'https://images.unsplash.com/photo-1702001145743-094b0b7ead51?w=400&q=70&auto=format&fit=crop' },
    { kicker: 'Collection', title: 'Beads & Malas', img: 'https://images.unsplash.com/photo-1784034008011-1cf10e243b67?w=400&q=70&auto=format&fit=crop' },
    { kicker: 'From the Archive', title: 'What a master carver reads in the grain', img: 'https://images.unsplash.com/photo-1779031242469-ef2e794987b0?w=400&q=70&auto=format&fit=crop' },
  ];
  const card = document.querySelector('[data-feature]');
  let fi = 0;
  const showFeature = (dir) => {
    fi = (fi + dir + features.length) % features.length;
    card.classList.add('is-swapping');
    setTimeout(() => {
      const f = features[fi];
      card.querySelector('[data-feature-kicker]').textContent = f.kicker;
      card.querySelector('[data-feature-title]').textContent = f.title;
      card.querySelector('[data-feature-img]').src = f.img;
      card.classList.remove('is-swapping');
    }, 280);
  };
  card.querySelector('[data-feature-prev]').addEventListener('click', () => showFeature(-1));
  card.querySelector('[data-feature-next]').addEventListener('click', () => showFeature(1));

  /* Craft rail + stepper */
  const rail = document.querySelector('[data-rail]');
  const steps = [...rail.children];
  const now = document.querySelector('[data-step-now]');
  const bar = document.querySelector('[data-step-bar]');
  const stepBy = (dir) => {
    const w = steps[0].getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 16);
    rail.scrollBy({ left: dir * w, behavior: 'smooth' });
  };
  document.querySelector('[data-rail-prev]').addEventListener('click', () => stepBy(-1));
  document.querySelector('[data-rail-next]').addEventListener('click', () => stepBy(1));

  // Leftmost card in view drives the stepper; scroll is on the rail, not the window.
  let ticking = false;
  const syncStep = () => {
    ticking = false;
    const max = rail.scrollWidth - rail.clientWidth;
    const atEnd = max > 0 && rail.scrollLeft >= max - 4;
    const w = steps[0].getBoundingClientRect().width + 16;
    const i = atEnd ? steps.length - 1 : Math.round(rail.scrollLeft / w);
    now.textContent = String(i + 1).padStart(2, '0');
    bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
  };
  rail.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(syncStep); }
  }, { passive: true });
  syncStep();
})();
