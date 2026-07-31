/* Ora — interactions. No dependencies. */
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
  $$('.reveal').forEach((el) => io.observe(el));
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

  /* schedule --------------------------------------------------------- */
  const WEEK = {
    Mon: [
      ['06:45', 'Reformer', 'Nadia', 2],
      ['09:30', 'Mat Flow', 'Iris', 6],
      ['12:15', 'Strength', 'Sam', 4],
      ['18:00', 'Reformer', 'Nadia', 0],
      ['19:15', 'Restore', 'Iris', 5],
    ],
    Tue: [
      ['07:00', 'Strength', 'Sam', 3],
      ['10:00', 'Reformer', 'Nadia', 1],
      ['17:30', 'Mat Flow', 'Iris', 7],
      ['18:45', 'Strength', 'Sam', 2],
    ],
    Wed: [
      ['06:45', 'Reformer', 'Nadia', 5],
      ['09:15', 'Restore', 'Iris', 8],
      ['12:30', 'Mat Flow', 'Iris', 4],
      ['18:00', 'Strength', 'Sam', 0],
      ['19:30', 'Reformer', 'Nadia', 3],
    ],
    Thu: [
      ['07:15', 'Mat Flow', 'Iris', 6],
      ['11:00', 'Reformer', 'Nadia', 2],
      ['18:15', 'Strength', 'Sam', 1],
    ],
    Fri: [
      ['06:45', 'Strength', 'Sam', 4],
      ['09:30', 'Reformer', 'Nadia', 3],
      ['17:00', 'Restore', 'Iris', 8],
      ['18:15', 'Mat Flow', 'Iris', 5],
    ],
    Sat: [
      ['08:30', 'Reformer', 'Nadia', 1],
      ['09:45', 'Strength', 'Sam', 6],
      ['11:00', 'Mat Flow', 'Iris', 4],
      ['12:15', 'Restore', 'Iris', 7],
    ],
    Sun: [
      ['09:00', 'Restore', 'Iris', 8],
      ['10:15', 'Reformer', 'Nadia', 2],
      ['11:30', 'Mat Flow', 'Iris', 5],
    ],
  };

  const slots = $('#slots');
  const render = (day) => {
    slots.innerHTML = WEEK[day].map(([time, name, coach, left]) => `
      <li>
        <span class="slot__time">${time}</span>
        <span class="slot__name">${name}</span>
        <span class="slot__coach">${coach}</span>
        <span class="slot__left${left && left <= 2 ? ' low' : ''}">${
          left === 0 ? 'Full' : `${left} left`
        }</span>
        <button class="slot__book"${left === 0 ? ' disabled' : ''}>${
          left === 0 ? 'Waitlist' : 'Book'
        }</button>
      </li>`).join('');

    $$('.slot__book', slots).forEach((b) => {
      if (b.disabled) return;
      b.addEventListener('click', () => {
        b.textContent = 'Booked';
        b.classList.add('done');
        b.disabled = true;
      });
    });
  };

  const days = $$('#days button');
  days.forEach((b) => b.addEventListener('click', () => {
    days.forEach((o) => o.setAttribute('aria-selected', String(o === b)));
    render(b.dataset.day);
  }));
  days[0].setAttribute('aria-selected', 'true');
  render('Mon');

  /* pricing toggle --------------------------------------------------- */
  const toggles = $$('#toggle button');
  toggles.forEach((b) => b.addEventListener('click', () => {
    toggles.forEach((o) => o.classList.toggle('is-on', o === b));
    const yearly = b.dataset.mode === 'year';
    $$('[data-price]').forEach((el) => {
      el.textContent = `$${yearly ? el.dataset.year : el.dataset.price}`;
    });
  }));

  /* intro offer ------------------------------------------------------ */
  const form = $('#trial');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#trialMsg');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#email').value.trim());
    msg.classList.toggle('err', !ok);
    msg.textContent = ok
      ? 'Sent — your intro pass is in your inbox.'
      : 'That email address looks incomplete.';
    if (ok) form.reset();
  });
})();
