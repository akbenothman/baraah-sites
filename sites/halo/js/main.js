/* Halo — interactions. No dependencies. */
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

  /* shade picker ----------------------------------------------------- */
  const shot = $('#shadeImg');
  const shadeName = $('#shadeName');
  $$('#shades button').forEach((b, i) => {
    if (i === 0) b.classList.add('is-on');
    b.addEventListener('click', () => {
      $$('#shades button').forEach((o) => o.classList.remove('is-on'));
      b.classList.add('is-on');
      shadeName.textContent = b.dataset.name;
      shot.classList.add('swap');
      setTimeout(() => {
        shot.src = `img/shade-${b.dataset.shade}.svg`;
        shot.alt = `Barrier Serum in ${b.dataset.name}`;
        shot.classList.remove('swap');
      }, 260);
    });
  });

  /* quantity + bag --------------------------------------------------- */
  const qtyEl = $('#qty');
  const bagN = $('#bagN');
  const addBtn = $('#addBtn');
  let qty = 1;
  let bag = 0;
  const price = 38;

  const renderQty = () => {
    qtyEl.textContent = qty;
    addBtn.textContent = `Add to bag — $${qty * price}`;
  };
  $('#minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); renderQty(); });
  $('#plus').addEventListener('click', () => { qty = Math.min(9, qty + 1); renderQty(); });

  const addToBag = (n, btn) => {
    bag += n;
    bagN.textContent = bag;
    if (!btn) return;
    const was = btn.textContent;
    btn.textContent = 'Added';
    setTimeout(() => { btn.textContent = was; }, 1500);
  };
  addBtn.addEventListener('click', () => addToBag(qty, addBtn));
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => addToBag(1, b)));

  /* signup ----------------------------------------------------------- */
  const form = $('#signup');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#signupMsg');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#email').value.trim());
    msg.classList.toggle('err', !ok);
    msg.textContent = ok ? 'Your code is on its way.' : 'Please enter a valid email.';
    if (ok) form.reset();
  });
})();
