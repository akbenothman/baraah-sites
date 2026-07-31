/* Verano — interactions. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* sticky nav: condense on scroll, hide when diving down ------------- */
  const nav = $('#nav');
  const measure = () => document.documentElement.style
    .setProperty('--navh', `${nav.offsetHeight}px`);
  measure();
  addEventListener('resize', measure);
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    const diving = y > last + 4;
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 420 && diving && $('#drawer').hidden);
    last = y;
  }, { passive: true });

  /* mobile drawer ---------------------------------------------------- */
  const burger = $('#burger');
  const drawer = $('#drawer');
  const setDrawer = (open) => {
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', (e) => { if (e.target.tagName === 'A') setDrawer(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  /* bag -------------------------------------------------------------- */
  const badge = $('#cartN');
  let items = 0;
  $$('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      items += 1;
      badge.textContent = items;
      badge.classList.add('pop');
      setTimeout(() => badge.classList.remove('pop'), 320);
      const label = btn.textContent;
      btn.textContent = 'Added';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = label; btn.classList.remove('done'); }, 1600);
    });
  });

  /* testimonials ----------------------------------------------------- */
  const quotes = $$('.quote');
  const dots = $('#quoteDots');
  if (quotes.length && dots) {
    let at = 0;
    quotes.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Testimonial ${i + 1}`);
      b.addEventListener('click', () => show(i));
      dots.append(b);
    });
    const show = (i) => {
      at = (i + quotes.length) % quotes.length;
      quotes.forEach((q, n) => q.classList.toggle('is-on', n === at));
      $$('button', dots).forEach((d, n) => d.setAttribute('aria-selected', String(n === at)));
    };
    show(0);
    if (!calm) {
      let timer = setInterval(() => show(at + 1), 6000);
      $('.quotes').addEventListener('pointerenter', () => clearInterval(timer));
      $('.quotes').addEventListener('pointerleave', () => { timer = setInterval(() => show(at + 1), 6000); });
    }
  }

  /* newsletter ------------------------------------------------------- */
  const form = $('#signup');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#signupMsg');
    const value = $('#email').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    msg.classList.toggle('err', !ok);
    msg.textContent = ok
      ? 'Lovely — check your inbox on Thursday.'
      : 'That email looks incomplete.';
    if (ok) form.reset();
  });
})();
