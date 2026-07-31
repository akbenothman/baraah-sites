/* Portfolio hub — interactions. No dependencies. */
(() => {
  'use strict';
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* reveal on scroll ------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el) => io.observe(el));
  requestAnimationFrame(() => $$('.rise').forEach((el) => el.classList.add('in')));

  /* sticky nav ------------------------------------------------------- */
  const nav = document.getElementById('nav');
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 500 && y > last + 4);
    last = y;
  }, { passive: true });
})();
