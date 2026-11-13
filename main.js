/* Daniel Ruiz Figueroa · Portfolio — interactions (no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* ---------- reveal on scroll + decoded headings ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>+';
  function decode(el) {
    var final = el.dataset.text || (el.dataset.text = el.textContent);
    var start = performance.now(), dur = 700;
    (function tick(now) {
      var k = Math.min(1, (now - start) / dur), out = '';
      for (var i = 0; i < final.length; i++) {
        out += (i < k * final.length || final[i] === ' ') ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (k < 1) requestAnimationFrame(tick);
    })(start);
  }
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        var h = en.target.querySelector('[data-decode]');
        if (h) decode(h);
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- descent telemetry: scroll position as altitude ---------- */
  var nav = $('#nav'), links = $$('.nav__links a');
  var phased = $$('[data-phase]');
  var altNav = $('#alt-nav'), altHud = $('#alt-hud'), mark = $('#hud-mark'), phaseEl = $('#phase'), planet = $('.planet');
  var ORBIT_KM = 408, lastY = 0, scrollY = 0, progress = 0, lastPhase = '';
  function onScroll() {
    scrollY = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    var alt = Math.round(ORBIT_KM * Math.pow(1 - progress, 1.6));
    altNav.textContent = alt; altHud.textContent = alt;
    mark.style.setProperty('--y', (progress * 220).toFixed(1) + 'px');
    /* the planet's limb rises into view over the second half of the descent */
    var rise = Math.max(0, (progress - 0.45) / 0.55);
    planet.style.setProperty('--rise', (rise * rise * window.innerHeight * 0.38).toFixed(1) + 'px');

    nav.classList.toggle('is-scrolled', scrollY > 10);
    nav.classList.toggle('is-hidden', scrollY > lastY && scrollY > 400);
    lastY = scrollY;

    var mid = scrollY + window.innerHeight * 0.4, current = phased[0];
    phased.forEach(function (s) { if (s.offsetTop <= mid) current = s; });
    if (current.dataset.phase !== lastPhase) {
      lastPhase = current.dataset.phase;
      phaseEl.textContent = lastPhase;
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id); });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- panel tilt ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.target.closest('.sim')) return;           /* keep the sketch steady while flying */
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 2.4).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 2.4).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- copy email ---------- */
  var copy = $('#copy');
  copy.addEventListener('click', function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText($('#mail').textContent.trim()).then(function () {
      copy.textContent = 'Copied'; copy.classList.add('is-done');
      setTimeout(function () { copy.textContent = 'Copy'; copy.classList.remove('is-done'); }, 1600);
    }, function () {});
  });

  /* ---------- star field with depth ---------- */
  (function () {
    var canvas = $('#space'), ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var W, H, stars = [], px = 0, py = 0, tx = 0, ty = 0, running = true;
    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(260, (W * H) / 6500));
      stars = [];
      for (var i = 0; i < n; i++) {
        var z = Math.pow(Math.random(), 2.2);            /* most stars are far away */
        stars.push({ x: Math.random() * W, y: Math.random() * H, z: z, r: 0.35 + z * 1.5, a: 0.25 + z * 0.7, t: Math.random() * 6.28, warm: Math.random() < 0.12 });
      }
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var y = (s.y - scrollY * (0.05 + s.z * 0.5) + py * s.z * 30) % H; if (y < 0) y += H;
        var x = s.x + px * s.z * 30;
        var tw = reduce ? 1 : 0.7 + 0.3 * Math.sin(now / 900 + s.t);
        ctx.fillStyle = (s.warm ? 'rgba(255,214,160,' : 'rgba(205,225,255,') + (s.a * tw).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      }
    }
    function loop(now) { if (!running) return; draw(now); requestAnimationFrame(loop); }
    window.addEventListener('resize', build);
    window.addEventListener('pointermove', function (e) { tx = e.clientX / W - 0.5; ty = e.clientY / H - 0.5; }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      var was = running; running = !document.hidden;
      if (running && !was && !reduce) requestAnimationFrame(loop);
    });
    build();
    if (reduce) { draw(0); window.addEventListener('scroll', function () { draw(0); }, { passive: true }); }
    else requestAnimationFrame(loop);
  })();

  /* ---------- SKYFALL warning replay (figures from the project's results) ---------- */
  (function () {
    var list = $('#replay-bars'); if (!list) return;
    var STEPS = [['± 23 h', 376], ['± 12 h', 351], ['± 10 h', 315], ['± 4 h', 196], ['± 2 h', 112], ['± 1 h', 48], ['± 43 min', 35]];
    var area = $('#rp-area'), delta = $('#rp-delta'), play = $('#replay-play'), items = [], shown = 376, timer = 0, tween = 0;
    STEPS.forEach(function (s, i) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" aria-label="Warning ' + s[0] + ', ' + s[1] + ' million square kilometres"><span>' + s[0] + '</span><i style="--w:' + (s[1] / 376 * 100).toFixed(1) + '%"></i><span>' + s[1] + '</span></button>';
      li.firstChild.addEventListener('click', function () { stop(); select(i); });
      list.appendChild(li); items.push(li);
    });
    function select(i) {
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-past', k < i); });
      var target = STEPS[i][1], from = shown, t0 = performance.now();
      cancelAnimationFrame(tween);
      (function tick(now) {
        var k = reduce ? 1 : Math.min(1, (now - t0) / 500);
        shown = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
        area.textContent = shown;
        if (k < 1) tween = requestAnimationFrame(tick);
      })(t0);
      delta.textContent = i === 0 ? 'First warning, 4 days out' : '−' + Math.round((1 - target / 376) * 100) + ' % vs the first warning';
    }
    function stop() { clearInterval(timer); timer = 0; play.textContent = 'Play'; }
    function run() {
      if (timer) return stop();
      var i = 0; select(0); play.textContent = 'Pause';
      timer = setInterval(function () { i++; if (i >= STEPS.length) return stop(); select(i); }, 950);
    }
    play.addEventListener('click', run);
    select(0);
    if ('IntersectionObserver' in window && !reduce) {
      var once = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { once.disconnect(); run(); } }, { threshold: 0.6 });
      once.observe(list);
    }
  })();

  /* ---------- landing sketch (Mission 02) ---------- */
  (function () {
    var cv = $('#sim-canvas'); if (!cv || !cv.getContext) return;
    var c = cv.getContext('2d'), W = cv.width, H = cv.height;
    var BODIES = {
      moon: { name: 'Moon', g: 1.62, sky: '#03050a', ground: '#8f97a6', dust: '190,198,210' },
      mars: { name: 'Mars', g: 3.71, sky: '#120807', ground: '#b5553a', dust: '226,140,104' },
      x:    { name: 'Planet X', g: 5.4, sky: '#060a12', ground: '#3f7f8c', dust: '127,227,255' }
    };
    var START_ALT = 300, SAFE = 4, GROUND = H - 46;
    var body = BODIES.moon, st, raf = 0, burning = false, last = 0, visible = true;
    var elAlt = $('#t-alt'), elVel = $('#t-vel'), elFuel = $('#t-fuel'), status = $('#sim-status');
    var startBtn = $('#sim-start'), burnBtn = $('#sim-burn');
    var stars = []; for (var i = 0; i < 70; i++) stars.push([Math.random() * W, Math.random() * (GROUND - 20), Math.random()]);
    var terrain = []; for (var x = 0; x <= W; x += 16) terrain.push(Math.abs(x - W / 2) < 70 ? 0 : (Math.sin(x * 0.045) * 7 + Math.sin(x * 0.13) * 4));

    function reset() { st = { alt: START_ALT, v: -10, fuel: 100, state: 'idle', puffs: [] }; }
    function say(t, cls) { status.textContent = t; status.className = 'sim__status' + (cls ? ' ' + cls : ''); }
    function readout() {
      elAlt.textContent = Math.max(0, st.alt).toFixed(0);
      elVel.textContent = st.v.toFixed(1);
      elFuel.textContent = Math.max(0, st.fuel).toFixed(0);
    }
    function step(dt) {
      var a = -body.g;
      if (burning && st.fuel > 0) {
        a += body.g * 2.3 + 2.2;
        st.fuel -= dt * 8.5;
        st.puffs.push({ x: (Math.random() - 0.5) * 8, y: 0, life: 1 });
      }
      st.v += a * dt; st.alt += st.v * dt;
      if (st.alt <= 0) {
        st.alt = 0;
        var speed = Math.abs(st.v);
        if (speed <= SAFE) { st.state = 'landed'; say('Touchdown on ' + body.name + ' at ' + speed.toFixed(1) + ' m/s. Nicely flown.', 'is-ok'); }
        else { st.state = 'crashed'; say('Impact at ' + speed.toFixed(1) + ' m/s. The limit is ' + SAFE + ' m/s. Try again.', 'is-bad'); }
        st.v = 0; burning = false; burnBtn.disabled = true; burnBtn.classList.remove('is-held');
        startBtn.textContent = 'Fly again';
      }
    }
    function draw() {
      c.fillStyle = body.sky; c.fillRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) { c.fillStyle = 'rgba(210,225,255,' + (0.2 + stars[i][2] * 0.6) + ')'; c.fillRect(stars[i][0], stars[i][1], 1.4, 1.4); }
      /* altitude scale */
      c.strokeStyle = 'rgba(150,180,220,.25)'; c.fillStyle = 'rgba(150,180,220,.6)'; c.font = '10px monospace'; c.lineWidth = 1;
      for (var m = 0; m <= START_ALT; m += 50) {
        var ty = GROUND - (m / START_ALT) * (GROUND - 40);
        c.beginPath(); c.moveTo(14, ty); c.lineTo(m % 100 === 0 ? 30 : 22, ty); c.stroke();
        if (m % 100 === 0) c.fillText(m, 34, ty + 3);
      }
      /* terrain and pad */
      c.fillStyle = body.ground; c.beginPath(); c.moveTo(0, H);
      for (var k = 0; k < terrain.length; k++) c.lineTo(k * 16, GROUND - terrain[k]);
      c.lineTo(W, H); c.closePath(); c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
      c.fillStyle = '#7fe3ff'; c.fillRect(W / 2 - 46, GROUND - 2, 92, 2);
      /* lander */
      var y = GROUND - 18 - (st.alt / START_ALT) * (GROUND - 58), x = W / 2;
      if (st.state === 'crashed') {
        c.fillStyle = 'rgba(255,196,107,.9)';
        for (var d = 0; d < 9; d++) { c.beginPath(); c.arc(x + Math.cos(d * 0.7) * 22, GROUND - 8 - Math.abs(Math.sin(d * 1.3)) * 18, 3 + (d % 3), 0, 6.3); c.fill(); }
      } else {
        for (var p = st.puffs.length - 1; p >= 0; p--) {
          var q = st.puffs[p]; q.y += 2.4; q.life -= 0.06;
          if (q.life <= 0) { st.puffs.splice(p, 1); continue; }
          c.fillStyle = 'rgba(255,196,107,' + q.life.toFixed(2) + ')';
          c.beginPath(); c.arc(x + q.x, y + 20 + q.y, 4 * q.life + 1, 0, 6.3); c.fill();
        }
        c.strokeStyle = '#e9eef7'; c.lineWidth = 2; c.fillStyle = '#0d1320';
        c.beginPath(); c.moveTo(x - 12, y + 6); c.lineTo(x - 20, y + 18); c.moveTo(x + 12, y + 6); c.lineTo(x + 20, y + 18); c.stroke();
        c.beginPath(); c.moveTo(x - 24, y + 18); c.lineTo(x - 16, y + 18); c.moveTo(x + 16, y + 18); c.lineTo(x + 24, y + 18); c.stroke();
        c.beginPath(); c.rect(x - 13, y - 8, 26, 16); c.fill(); c.stroke();
        c.beginPath(); c.arc(x, y - 8, 9, Math.PI, 0); c.fill(); c.stroke();
        c.fillStyle = '#7fe3ff'; c.fillRect(x - 3, y - 12, 6, 4);
        if (st.state === 'landed') { c.fillStyle = 'rgba(' + body.dust + ',.25)'; c.beginPath(); c.ellipse(x, GROUND, 60, 6, 0, 0, 6.3); c.fill(); }
      }
      c.fillStyle = 'rgba(150,180,220,.7)'; c.font = '10px monospace';
      c.fillText(body.name.toUpperCase() + '  G ' + body.g.toFixed(2) + ' M/S2', W - 170, 22);
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (st.state === 'flying') { step(dt); readout(); }
      draw();
      raf = (st.state === 'flying' && visible) ? requestAnimationFrame(frame) : 0;
    }
    function start() {
      reset(); st.state = 'flying'; burning = false;
      burnBtn.disabled = false; startBtn.textContent = 'Restart';
      say('Descending toward ' + body.name + '. Hold to burn.');
      last = performance.now(); if (!raf) raf = requestAnimationFrame(frame);
    }
    function setBurn(on) {
      if (st.state !== 'flying') return;
      burning = on; burnBtn.classList.toggle('is-held', on);
    }
    startBtn.addEventListener('click', start);
    burnBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); setBurn(true); });
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (ev) { burnBtn.addEventListener(ev, function () { setBurn(false); }); });
    $('#sim').addEventListener('keydown', function (e) {
      if (e.code === 'Space' && st.state === 'flying') { e.preventDefault(); setBurn(true); }
    });
    $('#sim').addEventListener('keyup', function (e) { if (e.code === 'Space') { e.preventDefault(); setBurn(false); } });
    $$('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.seg button').forEach(function (o) { o.classList.toggle('is-on', o === b); });
        body = BODIES[b.dataset.body]; reset(); burnBtn.disabled = true; startBtn.textContent = 'Start descent';
        say(body.name + ' selected. Gravity ' + body.g.toFixed(2) + ' m/s².'); readout(); draw();
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && st.state === 'flying' && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }).observe(cv);
    }
    reset(); readout(); draw();
  })();
})();
