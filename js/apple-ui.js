// js/apple-ui.js — componentes da camada Apple-lite (branch apple-lite)
// 1) Hero "corredor" (porte vanilla do ImageStreamHero, 21st.dev): CSS 3D puro,
//    keyframes gerados pela mesma geometria do original (tamanho aparente geométrico,
//    trilhos que abrem cedo, nascimento do card do lado oposto do eixo).
// 2) Faixa de temas (porte vanilla da galeria acordeão): hover/foco abre, clique amplia.
(function () {
  'use strict';

  /* ---------------- 1. HERO CORREDOR ---------------- */
  // Geometria em PIXELS calculados a partir da largura real do container (1 unidade = 1% da largura).
  // Antes usava `cqw` dentro de @keyframes: Safari/iOS e Chrome antigo nao resolvem a unidade ali e a
  // animacao ficava invalida (cards estaticos no celular). Pixels funcionam em qualquer CSS 3D.
  var root = document.querySelector('[data-stream-hero]');
  if (root) {
    var imgs = [];
    try { imgs = JSON.parse(root.getAttribute('data-images') || '[]'); } catch (e) {}
    var cards = +root.dataset.cards || 8, speed = +root.dataset.speed || 26, axis = +root.dataset.axis || 55;
    var P = { perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 1.2, birthHeight: 2.6, exitHeight: 46,
              railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 };
    var styleEl = document.createElement('style'); document.head.appendChild(styleEl);
    var stage = document.createElement('div'); stage.className = 'ish-stage'; stage.setAttribute('aria-hidden', 'true');
    var layer = document.createElement('div'); layer.className = 'ish-layer'; stage.appendChild(layer);
    var els = [];
    ['ishR', 'ishL'].forEach(function (name, side) {
      for (var i = 0; i < cards; i++) {
        var c = document.createElement('div'); c.className = 'ish-card';
        var src = imgs.length ? imgs[i % imgs.length] : null;
        if (src) { var im = document.createElement('img'); im.src = src; im.alt = ''; im.decoding = 'async'; im.draggable = false; c.appendChild(im); }
        c.style.animationName = name; c.style.animationDuration = speed + 's';
        c.style.animationTimingFunction = 'linear'; c.style.animationIterationCount = 'infinite';
        c.style.animationDelay = (-(i * speed) / cards) + 's';
        layer.appendChild(c); els.push(c);
      }
    });
    root.insertBefore(stage, root.firstChild);

    function kf(dir, name, u) {
      var s = [];
      for (var i = 0; i <= P.stops; i++) {
        var t = i / P.stops;
        var scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, t);
        var z = P.perspective * (1 - 1 / scale);
        var rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - t, P.fan);
        var turn = P.turnBirth + (P.turnExit - P.turnBirth) * t;
        s.push((t * 100).toFixed(2) + '%{transform:translate3d(' + (dir * rail * u).toFixed(1) + 'px,0,' + (z * u).toFixed(1) + 'px) rotateY(' + (-dir * turn).toFixed(2) + 'deg)}');
      }
      return '@keyframes ' + name + '{' + s.join('') + '}';
    }
    var lastW = 0;
    function build() {
      var W = root.clientWidth || 360; if (Math.abs(W - lastW) < 4) return; lastW = W;
      var u = W / 100;
      styleEl.textContent = kf(1, 'ishR', u) + kf(-1, 'ishL', u);
      stage.style.perspective = (P.perspective * u) + 'px';
      stage.style.perspectiveOrigin = '50% ' + axis + '%';
      els.forEach(function (c) {
        c.style.left = '50%'; c.style.top = axis + '%';
        c.style.width = (P.cardWidth * u) + 'px'; c.style.height = (P.cardHeight * u) + 'px';
        c.style.marginLeft = (-P.cardWidth / 2 * u) + 'px'; c.style.marginTop = (-P.cardHeight / 2 * u) + 'px';
        c.style.borderRadius = (P.cardRadius * u) + 'px';
      });
    }
    build();
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(build, 150); });
    if (window.ResizeObserver) { new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(build, 150); }).observe(root); }
  }

  /* ---------------- 2. FAIXA DE TEMAS ---------------- */
  var strip = document.getElementById('tstrip');
  if (strip) {
    var items = [].slice.call(strip.querySelectorAll('.tstrip-item'));
    var cur = +strip.dataset.default || 0;
    var touchMode = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    function setOn(i) {
      cur = i;
      items.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    }
    if (!touchMode) setOn(cur);
    items.forEach(function (el, i) {
      el.addEventListener('mouseenter', function () { if (!touchMode) setOn(i); });
      el.addEventListener('focus', function () { if (!touchMode) setOn(i); });
      el.addEventListener('click', function () { openTema(el); });
    });

    var lb = document.getElementById('temaLb');
    if (lb) {
      var lbImg = document.getElementById('temaLbImg'), lbTit = document.getElementById('temaLbTit'),
          lbDesc = document.getElementById('temaLbDesc'), lbClose = lb.querySelector('.mural-lb-close');
      var openTema = function (el) {
        lbImg.src = el.dataset.img; lbImg.alt = 'Tema ' + el.dataset.title;
        lbTit.textContent = el.dataset.title; lbDesc.textContent = el.dataset.desc || '';
        lb.hidden = false; document.body.style.overflow = 'hidden'; lbClose.focus();
      };
      var closeTema = function () { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; };
      lbClose.addEventListener('click', closeTema);
      lb.addEventListener('click', function (e) { if (e.target === lb) closeTema(); });
      document.addEventListener('keydown', function (e) { if (!lb.hidden && e.key === 'Escape') closeTema(); });
    } else {
      var openTema = function () { window.location.href = 'temas.html'; };
    }
  }
})();
