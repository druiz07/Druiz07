/* Portfolio · Daniel Ruiz Figueroa — interacciones (sin dependencias) */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- textos en inglés (el español está en el HTML) ---------- */
  var EN = {
    'skip': 'Skip to content',
    'nav.about': 'About', 'nav.projects': 'Projects', 'nav.path': 'Path', 'nav.stack': 'Stack', 'nav.contact': 'Contact',
    'hero.eyebrow': 'Madrid, Spain',
    'hero.lead': 'Software developer based in Madrid. I work mostly with C#, C++ and Python.',
    'hero.cta1': 'See projects', 'hero.cta2': 'Get in touch',
    'about.title': 'About me',
    'about.p1': 'I am Daniel, a software developer based in Madrid and a graduate of Universidad Complutense de Madrid.',
    'about.p2': 'Besides C#, C++ and Python, I am comfortable with Java, JavaScript, HTML and CSS. I like learning, working in a team and solving problems.',
    'about.p3': 'To do: what I work on now and what I am looking for.',
    'facts.base': 'Based in', 'facts.lang': 'Languages', 'facts.langv': 'Spanish · English B2', 'facts.focus': 'Focus', 'facts.focusv': 'Software development',
    'projects.title': 'Projects',
    'sky.media': 'Demo video · to do', 'sky.badge': 'Featured project',
    'sky.desc': 'To do: what Skyfall is and the problem it solves.',
    'sky.b1': 'To do: my role in the project.', 'sky.b2': 'To do: one concrete result or fact.',
    'sky.tech': 'Technologies · to do', 'sky.demo': 'Demo · to do', 'sky.code': 'Code · to do',
    'ph.title': 'Next project', 'ph.desc': 'In progress.',
    'path.title': 'Path',
    'path.e1d': 'Dates · to do', 'path.e1t': 'To do: role and company', 'path.e1p': 'To do: what I did there, in one line.',
    'path.u1t': 'BSc in Video Game Development',
    'path.u1p': 'Universidad Complutense de Madrid. Final degree project: a planetary descent and landing simulator in C#, connected to Microsoft Azure to load its resources from the cloud.',
    'path.l1d': 'Languages', 'path.l1t': 'English B2 (Cambridge)', 'path.l1p': 'Native Spanish.',
    'stack.g1': 'Languages', 'stack.g2': 'Tools', 'stack.g3': 'Cloud',
    'contact.eyebrow': 'Contact', 'contact.title': "Let's talk.", 'contact.copy': 'Copy',
    'footer.top': 'Back to top ↑'
  };
  var COPIED = { es: 'Copiado', en: 'Copied' };
  var nodes = [].slice.call(document.querySelectorAll('[data-i18n]'));
  var ES = {};
  nodes.forEach(function (n) { ES[n.dataset.i18n] = n.innerHTML; });
  var lang = 'es';

  function applyLang(next) {
    lang = next;
    root.lang = next;
    nodes.forEach(function (n) {
      var k = n.dataset.i18n;
      n.innerHTML = next === 'en' && EN[k] ? EN[k] : ES[k];
    });
    document.querySelectorAll('#lang [data-lang]').forEach(function (s) {
      s.classList.toggle('is-on', s.dataset.lang === next);
    });
    store.set('lang', next);
  }
  var saved = store.get('lang');
  applyLang(saved === 'en' || saved === 'es' ? saved : ((navigator.language || 'es').slice(0, 2) === 'es' ? 'es' : 'en'));

  document.getElementById('lang').addEventListener('click', function () {
    var next = lang === 'es' ? 'en' : 'es';
    if (reduce) return applyLang(next);
    document.body.classList.add('is-swapping');
    setTimeout(function () { applyLang(next); document.body.classList.remove('is-swapping'); }, 220);
  });

  /* ---------- tema claro / oscuro con barrido circular ---------- */
  document.getElementById('theme').addEventListener('click', function (e) {
    var next = root.dataset.theme === 'light' ? 'dark' : 'light';
    var swap = function () { root.dataset.theme = next; store.set('theme', next); };
    if (reduce || !document.startViewTransition) return swap();
    root.style.setProperty('--vx', e.clientX + 'px');
    root.style.setProperty('--vy', e.clientY + 'px');
    document.startViewTransition(swap);
  });

  /* ---------- aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- barra de progreso, cabecera y enlace activo ---------- */
  var nav = document.getElementById('nav');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle('is-scrolled', y > 8);
    nav.classList.toggle('is-hidden', y > lastY && y > 320);
    lastY = y;
    var mid = y + window.innerHeight * 0.35, active = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= mid) active = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- foco de luz en las tarjetas ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- copiar email ---------- */
  var copy = document.getElementById('copy');
  copy.addEventListener('click', function () {
    var mail = document.querySelector('.contact__mail a').textContent.trim();
    var done = function () {
      var prev = copy.innerHTML;
      copy.textContent = COPIED[lang];
      copy.classList.add('is-done');
      setTimeout(function () { copy.innerHTML = prev; copy.classList.remove('is-done'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done, function () {});
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- fondo: partículas que caen despacio ---------- */
  var canvas = document.getElementById('sky');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx || reduce) return;
  var W, H, dpr, stars = [], px = 0, py = 0, tx = 0, ty = 0, running = true;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(140, (W * H) / 11000));
    stars = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random();
      stars.push({ x: Math.random() * W, y: Math.random() * H, z: z, r: 0.4 + z * 1.3, v: 0.08 + z * 0.5, a: 0.15 + z * 0.55 });
    }
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    var rgb = getComputedStyle(root).getPropertyValue('--star').trim() || '200,215,255';
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.v;
      if (s.y > H + 20) { s.y = -20; s.x = Math.random() * W; }
      var x = s.x + px * s.z * 24, y = s.y + py * s.z * 24;
      ctx.fillStyle = 'rgba(' + rgb + ',' + s.a + ')';
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      if (s.z > 0.82) {
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (s.a * 0.35) + ')';
        ctx.lineWidth = s.r * 0.8;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 18 * s.z); ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) {
    tx = e.clientX / W - 0.5; ty = e.clientY / H - 0.5;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    var was = running; running = !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  });
  resize();
  requestAnimationFrame(frame);
})();
