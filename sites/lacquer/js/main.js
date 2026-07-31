/* Lacquer — interactions. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* reveal on scroll ------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  $$('.reveal').forEach((el) => io.observe(el));
  requestAnimationFrame(() => $$('.rise').forEach((el) => el.classList.add('in')));

  /* nav -------------------------------------------------------------- */
  const nav = $('#nav');
  const drawer = $('#drawer');
  const burger = $('#burger');
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 420 && y > last + 4 && drawer.hidden);
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

  /* colour wall ------------------------------------------------------ */
  const swatches = $$('#swatches button');
  const swatchName = $('#swatchName');
  const pickSwatch = (btn) => {
    swatches.forEach((b) => b.classList.toggle('is-on', b === btn));
    swatchName.textContent = btn.dataset.name;
    document.documentElement.style.setProperty('--rose', btn.style.getPropertyValue('--c'));
  };
  swatches.forEach((b) => b.addEventListener('click', () => pickSwatch(b)));
  pickSwatch(swatches[1]);

  /* time slots ------------------------------------------------------- */
  let slot = null;
  $$('[data-slot]').forEach((b) => {
    b.addEventListener('click', () => {
      $$('[data-slot]').forEach((o) => o.classList.remove('is-on'));
      b.classList.add('is-on');
      slot = b.textContent.trim();
    });
  });

  /* booking ---------------------------------------------------------- */
  $('#bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#bookMsg');
    const name = $('#name').value.trim();
    const tel = $('#tel').value.trim();
    let problem = '';
    if (!slot) problem = 'Pick a time that works for you.';
    else if (name.length < 2) problem = 'We just need a name for the booking.';
    else if (tel.replace(/\D/g, '').length < 7) problem = 'That number looks too short.';

    msg.classList.toggle('err', Boolean(problem));
    msg.textContent = problem
      || `Thanks ${name} — holding ${slot} on ${$('#date').value}. We'll text to confirm.`;
  });
})();
