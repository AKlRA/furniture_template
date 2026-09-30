(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Intro: shown once per session, skipped for reduced motion */
  const intro = document.querySelector('[data-intro]');
  let seen = false;
  try { seen = sessionStorage.getItem('sm-intro') === '1'; } catch (e) {}
  const ready = () => root.classList.add('is-ready');
  if (seen || reduced) {
    root.classList.add('no-intro');
    requestAnimationFrame(ready);
  } else {
    body.classList.add('is-locked');
    setTimeout(() => {
      intro.classList.add('is-done');
      body.classList.remove('is-locked');
      ready();
      try { sessionStorage.setItem('sm-intro', '1'); } catch (e) {}
    }, 1500);
  }

  /* Entry reveals */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* Menu overlay */
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const setMenu = (open) => {
    root.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('is-locked', open);
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

  /* Collections deck: active item grows */
  const items = [...document.querySelectorAll('.deck__item')];
  const nameEl = document.querySelector('[data-deck-name]');
  const idxEl = document.querySelector('[data-deck-index]');
  let active = items.findIndex((el) => el.classList.contains('is-active'));
  const pad = (n) => String(n).padStart(2, '0');
  const setActive = (i) => {
    active = (i + items.length) % items.length;
    items.forEach((el, n) => {
      el.classList.toggle('is-active', n === active);
      el.setAttribute('aria-pressed', String(n === active));
    });
    nameEl.textContent = items[active].dataset.name;
    idxEl.textContent = `${pad(active + 1)} of ${pad(items.length)}`;
  };
  items.forEach((el, n) => {
    el.setAttribute('aria-label', el.dataset.name);
    el.addEventListener('click', () => setActive(n));
  });
  document.querySelector('[data-deck-prev]').addEventListener('click', () => setActive(active - 1));
  document.querySelector('[data-deck-next]').addEventListener('click', () => setActive(active + 1));
  setActive(active);
})();
