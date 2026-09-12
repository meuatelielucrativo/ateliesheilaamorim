// js/apple-ui.js — componentes da camada Apple-lite (branch apple-lite)
// 1) Hero "corredor" (porte vanilla do ImageStreamHero, 21st.dev): CSS 3D puro,
//    keyframes gerados pela mesma geometria do original (tamanho aparente geométrico,
//    trilhos que abrem cedo, nascimento do card do lado oposto do eixo).
// 2) Faixa de temas (porte vanilla da galeria acordeão): hover/foco abre, clique amplia.
(function () {
  'use strict';

  /* ---------------- 1. HERO CORREDOR ---------------- */
  var root = document.querySelector('[data-stream-hero]');
  if (root) {
    var ok = window.CSS && CSS.supports && CSS.supports('width', '1cqw') && CSS.supports('container-type', 'inline-size');
    if (!ok) { root.classList.add('no-stream'); }
    else {
      var imgs = [];
      try { imgs = JSON.parse(root.getAttribute('data-images') || '[]'); } catch (e) {}
      var cards = +root.dataset.cards || 8, speed = +root.dataset.speed || 26, axis = +root.dataset.axis || 55;
      var P = { perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 1.2, birthHeight: 2.6, exitHeight: 46,
                railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 };
      function kf(dir, name) {
        var s = [];
        for (var i = 0; i <= P.stops; i++) {
          var u = i / P.stops;
          var scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, u);
          var z = P.perspective * (1 - 1 / scale);
          var rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - u, P.fan);
          var turn = P.turnBirth + (P.turnExit - P.turnBirth) * u;
          s.push((u * 100).toFixed(2) + '%{transform:translate3d(' + (dir * rail).toFixed(2) + 'cqw,0,' + z.toFixed(2) + 'cqw) rotateY(' + (-dir * turn).toFixed(2) + 'deg)}');
        }
        return '@keyframes ' + name + '{' + s.join('') + '}';
      }
      var st = document.createElement('style');
      st.textContent = kf(1, 'ishR') + kf(-1, 'ishL');
      document.head.appendChild(st);

      var stage = document.createElement('div');
      stage.className = 'ish-stage'; stage.setAttribute('aria-hidden', 'true');
      stage.style.perspective = P.perspective + 'cqw';
      stage.style.perspectiveOrigin = '50% ' + axis + '%';
      var layer = document.createElement('div'); layer.className = 'ish-layer'; stage.appendChild(layer);

      ['ishR', 'ishL'].forEach(function (name) {
        for (var i = 0; i < cards; i++) {
          var src = imgs.length ? imgs[i % imgs.length] : null;
          var c = document.createElement('div');
          c.className = 'ish-card';
          c.style.cssText = 'left:50%;top:' + axis + '%;width:' + P.cardWidth + 'cqw;height:' + P.cardHeight + 'cqw;' +
            'margin-left:' + (-P.cardWidth / 2) + 'cqw;margin-top:' + (-P.cardHeight / 2) + 'cqw;border-radius:' + P.cardRadius + 'cqw;' +
            'animation:' + name + ' ' + speed + 's linear infinite;animation-delay:' + (-(i * speed) / cards) + 's';
          if (src) {
            var im = document.createElement('img');
            im.src = src; im.alt = ''; im.decoding = 'async'; im.draggable = false;
            c.appendChild(im);
          }
          layer.appendChild(c);
        }
      });
      root.insertBefore(stage, root.firstChild);
    }
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
