/* ===== Time Cut — main.js ===== */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce-motion');

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var intro = document.getElementById('intro');
  if (intro && !reduce) {
    document.body.style.overflow = 'hidden';
    var done = function () {
      intro.classList.add('is-done'); document.body.style.overflow = '';
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
      window.removeEventListener('click', done);
    };
    setTimeout(done, 2000); window.addEventListener('click', done);
  } else if (intro) { intro.parentNode && intro.parentNode.removeChild(intro); }

  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  var mq = window.matchMedia('(max-width:960px)'), lastFocus = null;
  function isMobile() { return mq.matches; }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (isMobile()) { nav.inert = !open; if (open) { lastFocus = document.activeElement; var f = nav.querySelector('a'); f && f.focus(); } else if (lastFocus) { lastFocus.focus(); } }
    else { nav.inert = false; }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A' && isMobile()) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
    var syncMq = function () { if (!isMobile()) { nav.classList.remove('open'); nav.inert = false; burger.setAttribute('aria-expanded', 'false'); } else { if (!nav.classList.contains('open')) nav.inert = true; } };
    mq.addEventListener ? mq.addEventListener('change', syncMq) : mq.addListener(syncMq); syncMq();
  }

  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    var fired = false, wd = new IntersectionObserver(function () { fired = true; wd.disconnect(); });
    wd.observe(document.body); setTimeout(function () { if (!fired) showAll(); }, 1500);
  }

  /* dynamic hours */
  var HOURS = { 1: [], 2: [[840, 1080]], 3: [[600, 1110]], 4: [[600, 1110]], 5: [[540, 1110]], 6: [[540, 1080]], 0: [] };
  function romeNow() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })); }
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
  function updateHours(lang) {
    var el = document.getElementById('hoursStatus'); if (!el) return;
    var now = romeNow(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var wins = HOURS[day] || [], open = false, nextClose = null, nextOpen = null, nextDay = null;
    wins.forEach(function (w) { if (mins >= w[0] && mins < w[1]) { open = true; nextClose = w[1]; } });
    if (!open) { for (var i = 0; i < wins.length; i++) { if (mins < wins[i][0]) { nextOpen = wins[i][0]; break; } } }
    if (!open && nextOpen === null) { for (var d = 1; d <= 7; d++) { var nd = (day + d) % 7; if ((HOURS[nd] || []).length) { nextDay = { d: nd, o: HOURS[nd][0][0] }; break; } } }
    var t = {
      it: { open: 'Aperto ora', closes: 'chiude alle', closed: 'Chiuso ora', opens: 'apre oggi alle', opensDay: 'apre', days: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] },
      en: { open: 'Open now', closes: 'closes at', closed: 'Closed now', opens: 'opens today at', opensDay: 'opens', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    }[lang] || {};
    var html;
    if (open) html = '<span class="dot"></span>' + t.open + ' · ' + t.closes + ' ' + fmt(nextClose);
    else if (nextOpen !== null) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opens + ' ' + fmt(nextOpen);
    else if (nextDay) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opensDay + ' ' + t.days[nextDay.d] + ' ' + fmt(nextDay.o);
    else html = '<span class="dot"></span>' + t.closed;
    el.className = 'hours__status ' + (open ? 'is-open' : 'is-closed'); el.innerHTML = html;
    document.querySelectorAll('.hours__table tr').forEach(function (r) { r.classList.toggle('today', parseInt(r.getAttribute('data-day'), 10) === day); });
  }

  var EN = {
    'skip': 'Skip to content',
    'nav.about': 'The salon', 'nav.services': 'Services', 'nav.gallery': 'Gallery', 'nav.where': 'Where & hours', 'nav.reviews': 'Reviews',
    'cta.book': 'Book',
    'hero.eyebrow': 'Hair salon · NoLo, Milan',
    'hero.concept': 'Take your time.',
    'hero.lead': "A small neighbourhood salon in NoLo where the cut starts with listening. Federico, Michele and their time — because the right result is never rushed. Welcoming, relaxed, made to measure.",
    'hero.cta2': 'Our services',
    'hero.stat1': 'on Google · 62 reviews', 'hero.stat2': 'Via Rovereto 6', 'hero.stat3': 'cut · colour · care',
    'hero.tag': 'NoLo · Milan',
    'story.label': 'The salon', 'story.title': 'The cut starts with listening.',
    'story.p1': "Time Cut is a neighbourhood salon on Via Rovereto, in the heart of NoLo: a few seats, botanical wallpaper, warm bulb-lit mirrors and a relaxed atmosphere. A place where you never feel rushed.",
    'story.p2': "<strong>Federico</strong> and <strong>Michele</strong> have a quality clients always mention: they listen and understand exactly what you're after — from a classic cut to the most rebellious wave — for a result that really looks like you.",
    'story.chip1': 'Listening & advice', 'story.chip2': 'Women & men', 'story.chip3': 'Relaxed atmosphere',
    'serv.label': 'Services', 'serv.title': 'What we do, with care.',
    'serv.1t': 'Cut & blow-dry', 'serv.1d': 'Tailored cuts, for women and men, with the right blow-dry and tips to redo it at home.',
    'serv.2t': 'Colour & lightening', 'serv.2d': 'Colour, tones, highlights and lightening for a natural, luminous result.',
    'serv.3t': 'Care & treatments', 'serv.3d': 'Restructuring treatments and targeted products for healthy, soft, well-kept hair.',
    'serv.4t': 'Curls & waves', 'serv.4d': 'Managing and enhancing curls and rebellious waves, with cuts made just for them.',
    'serv.note': 'Every service starts with a chat: tell us what you want and we find the way together.',
    'gallery.label': 'Gallery', 'gallery.title': 'A look inside.',
    'where.label': 'Where & hours', 'where.title': 'On Via Rovereto, in NoLo.',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'rev.label': 'Reviews', 'rev.title': "In our clients' words.",
    'book.label': 'Book', 'book.title': "Message us, we'll take care of it.",
    'book.lead': "The fastest way to book is WhatsApp: tell us what you're after and we'll find the first free slot. Or call us — we'll be waiting on Via Rovereto.",
    'book.call': 'Call · 351 774 4726',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'What do you offer?',
    'faq.a1': "We're a neighbourhood hair salon: cut and blow-dry, colour and lightening, hair care treatments and style advice. For women and men.",
    'faq.q2': 'How do I book?',
    'faq.a2': 'The fastest way is to message us on WhatsApp or call 351 774 4726. We find the first free slot, no rush.',
    'faq.q3': 'Where are you and what are your hours?',
    'faq.a3': 'On Via Rovereto 6, in NoLo. Open Tuesday 14–18, Wednesday and Thursday 10–18:30, Friday 9–18:30, Saturday 9–18. Closed Monday and Sunday.',
    'faq.q4': 'Do you handle curly and difficult hair?',
    'faq.a4': "Yes: from tailored cuts to managing waves and curls, the goal is to send you out with a result that looks like you.",
    'footer.where': 'Where we are', 'footer.hours': 'Tue–Sat · Mon & Sun closed', 'footer.book': 'Book', 'footer.by': 'By Federico & Michele', 'footer.credit': 'Demo website — Bespoke Studio',
    'ab.call': 'Call', 'ab.dir': 'Directions'
  };
  var IT = {};
  [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) { IT[el.getAttribute('data-i18n')] = el.innerHTML; });
  function applyLang(lang) {
    var dict = lang === 'en' ? EN : IT;
    [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) { var k = el.getAttribute('data-i18n'); if (dict[k] != null) el.innerHTML = dict[k]; });
    root.setAttribute('lang', lang);
    var it = document.querySelector('.lang__it'), en = document.querySelector('.lang__en');
    if (it && en) { it.classList.toggle('is-active', lang === 'it'); en.classList.toggle('is-active', lang === 'en'); }
    var lt = document.getElementById('langToggle');
    if (lt) lt.setAttribute('aria-label', lang === 'it' ? 'Switch language to English' : 'Passa all\'italiano');
    try { localStorage.setItem('tc-lang', lang); } catch (e) {}
    updateHours(lang);
  }
  var langToggle = document.getElementById('langToggle'), curLang = 'it';
  try { curLang = localStorage.getItem('tc-lang') || 'it'; } catch (e) {}
  if (langToggle) langToggle.addEventListener('click', function () { applyLang(root.getAttribute('lang') === 'it' ? 'en' : 'it'); });
  applyLang(curLang);
  setInterval(function () { updateHours(root.getAttribute('lang')); }, 60000);

  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightboxImg'), lbClose = document.getElementById('lightboxClose'), lbLast = null;
  function openLb(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lbLast = document.activeElement; lbClose.focus(); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; document.body.style.overflow = ''; lbLast && lbLast.focus(); }
  [].slice.call(document.querySelectorAll('.shot')).forEach(function (btn) { btn.addEventListener('click', function () { var img = btn.querySelector('img'); openLb(btn.getAttribute('data-full'), img ? img.alt : ''); }); });
  lbClose && lbClose.addEventListener('click', closeLb);
  lb && lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
})();
