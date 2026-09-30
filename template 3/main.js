(() => {
  const root = document.documentElement;
  const body = document.body;

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
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => setMenu(true));
  document.querySelector('[data-burger-close]').addEventListener('click', () => setMenu(false));
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

  /* Collection tabs drive the showcase */
  const u = (id, w = 2200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
  const collections = [
    { name: 'Beads & Malas', img: u('1784570343031-649cce9a185c'), alt: 'A strand of red-brown prayer beads with silver accents' },
    { name: 'Jewellery', img: u('1762328490563-9b9c300fba3e'), alt: 'A hand holding a strand of polished red beads' },
    { name: 'Objects', img: u('1790244528184-c9e3fdccde63'), alt: 'Turned wooden objects resting on a sandy log' },
    { name: 'Powder', img: u('1702001145743-094b0b7ead51'), alt: 'Cross-section of a sandalwood log showing the heartwood' },
    { name: 'Gifting', img: u('1770816307472-945144576a1f'), alt: 'An open wooden keepsake box in a pool of light' },
  ];
  collections.forEach((c) => { const i = new Image(); i.src = c.img; });

  const tabs = [...document.querySelectorAll('[data-tab]')];
  const stage = document.querySelector('.stage');
  const img = document.querySelector('[data-stage-img]');
  const title = document.querySelector('[data-stage-title]');
  const link = document.querySelector('[data-stage-link]');
  let current = 0;

  const select = (i) => {
    if (i === current) return;
    current = i;
    tabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    stage.classList.add('is-swapping');
    setTimeout(() => {
      const c = collections[i];
      img.src = c.img;
      img.alt = c.alt;
      title.textContent = c.name;
      link.firstChild.textContent = `Shop ${c.name} `;
      stage.classList.remove('is-swapping');
    }, 320);
  };
  tabs.forEach((t, n) => t.addEventListener('click', () => select(n)));
  document.querySelectorAll('[data-tab-link]').forEach((a) =>
    a.addEventListener('click', () => select(Number(a.dataset.tabLink)))
  );

  /* Arrow keys between tabs */
  document.querySelector('.tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    select(next);
    tabs[next].focus();
  });
})();
