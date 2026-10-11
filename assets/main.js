(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Nome nell'hero: le lettere entrano una alla volta (gerarchia: prima il nome) */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var text = h1.textContent; h1.textContent = ''; h1.setAttribute('aria-label', text);
    var n = 0;
    text.split(' ').forEach(function (wd, wi) {
      if (wi) h1.appendChild(document.createTextNode(' '));
      var box = document.createElement('span'); box.className = 'w'; box.setAttribute('aria-hidden', 'true');
      wd.split('').forEach(function (c) {
        var s = document.createElement('span'); s.className = 'char'; s.textContent = c;
        s.style.animationDelay = (0.25 + n++ * 0.045) + 's'; box.appendChild(s);
      });
      h1.appendChild(box);
    });
  }

  /* Ruolo che cambia: racconta i diversi mestieri in un solo spazio */
  var word = document.querySelector('.role .word');
  if (word && !reduce) {
    var words = JSON.parse(word.getAttribute('data-words')), w = 0;
    setInterval(function () {
      word.classList.add('out');
      setTimeout(function () { w = (w + 1) % words.length; word.textContent = words[w]; word.classList.remove('out'); }, 450);
    }, 2800);
  }

  /* Comparsa allo scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* Contatori */
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, end = +el.getAttribute('data-count'), t0 = null;
      if (reduce) return;
      el.textContent = '0';
      (function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1500, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });

  /* Nav, barra di avanzamento, parallasse leggera dell'hero, sezione attiva */
  var nav = document.querySelector('.nav'), bar = document.querySelector('.progress'), bg = document.querySelector('.hero-bg'),
      links = [].slice.call(document.querySelectorAll('.nav-links a')),
      secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }), ticking = false, last = -1;
  function onScroll() {
    var y = scrollY, h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    nav.classList.toggle('scrolled', y > 24);
    if (bg && !reduce && y < innerHeight * 1.2) bg.style.translate = '0 ' + (y * 0.22).toFixed(1) + 'px';
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
    if (cur !== last) {
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
      if (cur > -1 && innerWidth <= 640) { var a = links[cur], box = a.parentNode; box.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); }
      last = cur;
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (fine && !reduce) {
    /* Luce che segue il puntatore sui pannelli */
    document.querySelectorAll('.panel').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    /* Pulsanti magnetici: il cursore li "attira" appena */
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* Galleria a schermo intero */
  var lb = document.querySelector('.lightbox'), lbImg = lb.querySelector('img'), lbBtn = lb.querySelector('button'), opener = null;
  document.querySelectorAll('.gallery-item').forEach(function (g) {
    g.addEventListener('click', function () {
      var i = g.querySelector('img'); opener = g;
      lbImg.src = i.getAttribute('data-full') || i.src; lbImg.alt = i.alt;
      lb.classList.add('open'); document.body.style.overflow = 'hidden'; lbBtn.focus();
    });
  });
  function close() { if (!lb.classList.contains('open')) return; lb.classList.remove('open'); document.body.style.overflow = ''; if (opener) opener.focus(); }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) close(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* Un solo video alla volta */
  var vids = document.querySelectorAll('video');
  vids.forEach(function (v) { v.addEventListener('play', function () { vids.forEach(function (o) { if (o !== v) o.pause(); }); }); });

  /* Modulo: controllo campi, poi apre l'app di posta già compilata */
  var form = document.getElementById('contact-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    [].forEach.call(form.querySelectorAll('input,textarea'), function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.closest('.field').classList.toggle('invalid', bad);
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;
    var n = form.nome.value.trim(), m = form.email.value.trim(), t = form.messaggio.value.trim();
    location.href = 'mailto:luca.barlaam5@gmail.com?subject=' + encodeURIComponent('Contatto dal sito: ' + n) +
      '&body=' + encodeURIComponent(t + '\n\n' + n + ' · ' + m);
  });
  form.addEventListener('input', function (e) { var f = e.target.closest('.field'); if (f) f.classList.remove('invalid'); });
})();
