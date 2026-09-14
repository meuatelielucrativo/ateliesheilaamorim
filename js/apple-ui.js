// js/apple-ui.js — hero da home (branch apple-lite)
//
// DESKTOP/TABLET: "corredor" 3D (porte vanilla do ImageStreamHero, 21st.dev).
//   Geometria em PIXELS calculados a partir da largura real do container
//   (1 unidade = 1% da largura). Antes usava `cqw` dentro de @keyframes:
//   Safari/iOS e Chrome antigos nao resolvem a unidade ali e a animacao ficava
//   invalida (cards estaticos).
//
// CELULAR (<=640px): o corredor NAO e usado. Numa tela estreita ele fica
//   apertado, passa por tras do texto e consome bateria. No lugar entra uma
//   faixa horizontal em fluxo normal, abaixo do texto: nada se sobrepoe e o
//   movimento e uma translacao simples, que roda em qualquer aparelho.
//   Com "reduzir movimento" ligado a faixa para e vira rolagem manual, em vez
//   de congelar no meio do caminho parecendo quebrada.

(function () {
  'use strict';

  var root = document.querySelector('[data-stream-hero]');
  if (!root) return;

  var imgs = [];
  try { imgs = JSON.parse(root.getAttribute('data-images') || '[]'); } catch (e) {}
  if (!imgs.length) return;

  var cards = +root.dataset.cards || 8;
  var speed = +root.dataset.speed || 26;
  var axis = +root.dataset.axis || 55;
  var P = { perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 1.2, birthHeight: 2.6,
            exitHeight: 46, railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 };

  var mqMobile = window.matchMedia('(max-width: 640px)');
  var styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  var modo = null, stage = null, els = [], lastW = 0, rz = null;

  // ---------- corredor 3D ----------
  function kf(dir, name, u) {
    var s = [];
    for (var i = 0; i <= P.stops; i++) {
      var t = i / P.stops;
      var scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, t);
      var z = P.perspective * (1 - 1 / scale);
      var rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - t, P.fan);
      var turn = P.turnBirth + (P.turnExit - P.turnBirth) * t;
      s.push((t * 100).toFixed(2) + '%{transform:translate3d(' + (dir * rail * u).toFixed(1) + 'px,0,' +
        (z * u).toFixed(1) + 'px) rotateY(' + (-dir * turn).toFixed(2) + 'deg)}');
    }
    return '@keyframes ' + name + '{' + s.join('') + '}';
  }

  function medirCorredor() {
    var W = root.clientWidth || 360;
    if (Math.abs(W - lastW) < 4) return;
    lastW = W;
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

  function montarCorredor() {
    stage = document.createElement('div');
    stage.className = 'ish-stage'; stage.setAttribute('aria-hidden', 'true');
    var layer = document.createElement('div'); layer.className = 'ish-layer'; stage.appendChild(layer);
    els = [];
    ['ishR', 'ishL'].forEach(function (name) {
      for (var i = 0; i < cards; i++) {
        var c = document.createElement('div'); c.className = 'ish-card';
        var im = document.createElement('img');
        im.src = imgs[i % imgs.length]; im.alt = ''; im.decoding = 'async'; im.draggable = false;
        c.appendChild(im);
        c.style.animationName = name; c.style.animationDuration = speed + 's';
        c.style.animationTimingFunction = 'linear'; c.style.animationIterationCount = 'infinite';
        c.style.animationDelay = (-(i * speed) / cards) + 's';
        layer.appendChild(c); els.push(c);
      }
    });
    root.insertBefore(stage, root.firstChild);
    lastW = 0;
    medirCorredor();
  }

  // ---------- faixa do celular ----------
  function montarFaixa() {
    stage = document.createElement('div');
    stage.className = 'ish-marquee'; stage.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'ish-track';
    // a sequencia entra duas vezes: o laco fecha sem salto visivel
    for (var v = 0; v < 2; v++) {
      imgs.forEach(function (src) {
        var im = document.createElement('img');
        im.src = src; im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false;
        track.appendChild(im);
      });
    }
    stage.appendChild(track);
    styleEl.textContent = '@keyframes ishSlide{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}';
    track.style.animation = 'ishSlide ' + (imgs.length * 4) + 's linear infinite';
    root.appendChild(stage);   // fica DEPOIS do texto, em fluxo normal
    els = [];
  }

  function montar() {
    var novo = mqMobile.matches ? 'faixa' : 'corredor';
    if (novo === modo) return;
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    modo = novo;
    if (modo === 'faixa') montarFaixa(); else montarCorredor();
  }

  montar();

  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { montar(); if (modo === 'corredor') medirCorredor(); }, 150);
  });
  if (window.ResizeObserver && !mqMobile.matches) {
    new ResizeObserver(function () {
      clearTimeout(rz);
      rz = setTimeout(function () { if (modo === 'corredor') medirCorredor(); }, 150);
    }).observe(root);
  }
})();
