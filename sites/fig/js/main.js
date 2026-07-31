/* Fig & Vine — interactions. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* reveal ----------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
  const watch = () => $$('.reveal:not(.in)').forEach((el) => io.observe(el));
  watch();
  requestAnimationFrame(() => $$('.rise').forEach((el) => el.classList.add('in')));

  /* nav -------------------------------------------------------------- */
  const nav = $('#nav');
  const drawer = $('#drawer');
  const burger = $('#burger');
  const measure = () => document.documentElement.style
    .setProperty('--navh', `${nav.offsetHeight}px`);
  measure();
  addEventListener('resize', measure);

  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 460 && y > last + 4 && drawer.hidden);
    last = y;
  }, { passive: true });

  const setDrawer = (open) => {
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', (e) => { if (e.target.tagName === 'A') setDrawer(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  /* menu ------------------------------------------------------------- */
  const CARD = {
    dinner: [
      ['To start', [
        ['Hearth bread, cultured butter', '6', 'Baked to order, so give it ten minutes.'],
        ['Charred greens, anchovy, lemon', '11', ''],
        ['Grilled sardine, fennel, orange', '13', ''],
        ['Smoked almonds &amp; olives', '7', ''],
      ]],
      ['Over the fire', [
        ['Whole fish for two, salsa verde', '46', 'Whatever came in that morning.'],
        ['Dry-aged sirloin, bone marrow', '38', ''],
        ['Hispi cabbage, brown butter, hazelnut', '18', ''],
        ['Potatoes in beef fat', '9', ''],
      ]],
      ['To finish', [
        ['Burnt honey tart', '10', ''],
        ['Fig leaf ice cream', '8', ''],
        ['Cheese, three ways', '14', ''],
      ]],
      ['Set menu', [
        ['Feed me — six courses', '65', 'The whole kitchen, chosen for you. Table-wide only.'],
        ['Wine pairing', '45', ''],
      ]],
    ],
    brunch: [
      ['Sunday only', [
        ['Fire-baked eggs, tomato, chilli', '14', ''],
        ['Bread &amp; butter pudding French toast', '13', ''],
        ['Smoked trout, crème fraîche, dill', '16', ''],
        ['Mushrooms on toast, over coals', '12', ''],
      ]],
      ['Alongside', [
        ['Bloody Mary, house mix', '11', ''],
        ['Filter coffee, Verano roast', '4', 'Free refills until we close.'],
        ['Fresh blood orange', '5', ''],
      ]],
    ],
    wine: [
      ['By the glass', [
        ['Txakoli, Basque Country', '9', 'Sharp, salty, faintly fizzy.'],
        ['Gamay, Beaujolais', '11', ''],
        ['Chenin, Loire', '12', ''],
        ['Nebbiolo, Piedmont', '14', ''],
      ]],
      ['Bottles we love', [
        ['Trousseau, Jura', '58', ''],
        ['Assyrtiko, Santorini', '52', ''],
        ['Blaufränkisch, Burgenland', '61', ''],
        ['Something odd — ask us', '—', 'There is always something odd.'],
      ]],
    ],
  };

  const panel = $('#panel');
  const render = (key) => {
    panel.innerHTML = CARD[key].map(([group, rows]) => `
      <div class="menu__group">
        <h3>${group}</h3>
        <dl>
          ${rows.map(([name, price, note]) => `
            <div class="menu__row">
              <dt>${name}</dt>
              <dd>${price === '—' ? '—' : `£${price}`}</dd>
              ${note ? `<p>${note}</p>` : ''}
            </div>`).join('')}
        </dl>
      </div>`).join('');
  };

  const tabs = $$('#tabs button');
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    render(b.dataset.tab);
  }));
  tabs[0].setAttribute('aria-selected', 'true');
  render('dinner');

  /* reservation ------------------------------------------------------ */
  let time = null;
  $$('[data-time]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-time]').forEach((o) => o.classList.remove('is-on'));
    b.classList.add('is-on');
    time = b.textContent.trim();
  }));

  $('#bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#bookMsg');
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    let problem = '';
    if (!time) problem = 'Choose a sitting first.';
    else if (name.length < 2) problem = 'We need a name for the book.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) problem = 'That email looks incomplete.';

    msg.classList.toggle('err', Boolean(problem));
    msg.textContent = problem
      || `Requested — ${$('#party').value} at ${time} on ${$('#date').value}. We'll confirm by email.`;
  });
})();
