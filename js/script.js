// js/script.js — v4 (CRO) — branch apple-lite
// Mudanças desta versão:
// - Fluxo de "escolher tema" REMOVIDO. Todo produto entra direto na lista.
//   O tema passa a ser combinado no WhatsApp (menos atrito, menos abandono).
// - CTA único "Adicionar à Lista" em todos os produtos.
// - Micro-interação no ícone da lista a cada item adicionado.
// - Barra fixa de ação no mobile (WhatsApp sempre à mão).
// - Pop-up de boas-vindas removido.

// Google Analytics — init centralizado (o <script async> de cada HTML carrega a lib)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MPB5QZX4X9');

var ZAP = '5522988241470';
var FRASE_FINAL = 'Gostaria de ver as opções de temas para esses itens!';
var MSG_PADRAO = 'Oi Sheila! Vim pelo site e quero saber mais sobre o enxoval personalizado.';

function trackEvent(nome, params) {
  try { if (typeof gtag === 'function') gtag('event', nome, params || {}); } catch (e) {}
}

// ============================================================
// 1. ADICIONAR PRODUTO — sempre entra na lista, sem desvio
// O 3o parametro fica so por compatibilidade com os onclick que ja existem;
// 'consulta' apenas marca o item como "sob consulta".
// ============================================================
function escolherProduto(categoria, nomeProduto, tipo) {
  adicionarAoCarrinho({
    categoria: categoria,
    nome: nomeProduto,
    sob_consulta: tipo === 'consulta'
  });
  mostrarToast('Item adicionado à sua lista', 'sucesso');
}

// ============================================================
// 2. CARRINHO
// ============================================================
function lerCarrinho() {
  try { return JSON.parse(localStorage.getItem('meu_carrinho')) || []; }
  catch (e) { return []; }
}

function adicionarAoCarrinho(item) {
  var carrinho = lerCarrinho();
  carrinho.push(item);
  localStorage.setItem('meu_carrinho', JSON.stringify(carrinho));
  trackEvent('adicionar_lista', { produto: item.nome, categoria: item.categoria });
  atualizarContador();
  pulsarIconeLista();
  return carrinho.length - 1;
}

function removerItem(index) {
  var carrinho = lerCarrinho();
  carrinho.splice(index, 1);
  localStorage.setItem('meu_carrinho', JSON.stringify(carrinho));
  atualizarContador();
  if (carrinho.length === 0) { fecharModalLista(); mostrarToast('Lista esvaziada', 'info'); }
  else { mostrarLista(); }
}

function limparSacola() {
  if (confirm('Tem certeza que deseja limpar toda a sua lista?')) {
    localStorage.removeItem('meu_carrinho');
    atualizarContador();
    fecharModalLista();
  }
}

// ============================================================
// 3. MICRO-INTERACAO: o icone da lista "pula" a cada item
// ============================================================
function pulsarIconeLista() {
  var alvos = document.querySelectorAll('.sacola-float, .mbar-lista');
  alvos.forEach(function (el) {
    el.classList.remove('pulse');
    void el.offsetWidth;           // reinicia a animacao
    el.classList.add('pulse');
    setTimeout(function () { el.classList.remove('pulse'); }, 700);
  });
}

// ============================================================
// 4. TOAST
// ============================================================
function mostrarToast(mensagem, tipo, duracao) {
  tipo = tipo || 'sucesso'; duracao = duracao || 2400;
  var antigo = document.getElementById('toast-atelier');
  if (antigo) antigo.remove();
  var cores = { sucesso: '#1FA855', info: '#9A6B0F', erro: '#C0392B' };
  var t = document.createElement('div');
  t.id = 'toast-atelier';
  t.setAttribute('role', 'status');
  t.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%) translateY(-140%);' +
    'background:' + (cores[tipo] || cores.sucesso) + ';color:#fff;padding:12px 20px;border-radius:30px;' +
    'box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:99999;font-weight:700;font-size:.95rem;text-align:center;' +
    'max-width:90%;transition:transform .35s cubic-bezier(.2,.8,.2,1)';
  t.textContent = mensagem;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(function () {
    t.style.transform = 'translateX(-50%) translateY(-140%)';
    setTimeout(function () { t.remove(); }, 400);
  }, duracao);
}

// ============================================================
// 5. MODAL DA LISTA
// ============================================================
function injetarModalLista() {
  if (document.getElementById('modal-lista')) return;
  var modal = document.createElement('div');
  modal.id = 'modal-lista';
  modal.className = 'modal-lista-overlay';
  modal.innerHTML =
    '<div class="modal-lista-content" role="dialog" aria-modal="true" aria-label="Minha lista">' +
      '<div class="modal-lista-header"><span>Minha Lista</span>' +
        '<button type="button" class="modal-lista-fechar" onclick="fecharModalLista()" aria-label="Fechar">&times;</button></div>' +
      '<div id="modal-lista-itens" class="modal-lista-itens"></div>' +
      '<div class="modal-lista-nota">O valor de cada peça já inclui a personalização e o bordado. ' +
        'Os temas a gente escolhe junto, no WhatsApp.</div>' +
      '<div class="modal-lista-footer">' +
        '<button type="button" class="btn-continuar-lista" onclick="fecharModalLista()">Continuar escolhendo</button>' +
        '<button type="button" class="btn-finalizar-lista" onclick="finalizarCompraZap()">' +
          '<i class="fab fa-whatsapp"></i> Enviar no WhatsApp</button>' +
      '</div>' +
    '</div>';
  modal.addEventListener('click', function (e) { if (e.target === modal) fecharModalLista(); });
  document.body.appendChild(modal);
}

function mostrarLista() {
  var carrinho = lerCarrinho();
  if (carrinho.length === 0) { mostrarToast('Sua lista está vazia', 'erro'); return; }
  injetarModalLista();
  document.getElementById('modal-lista-itens').innerHTML = carrinho.map(function (item, i) {
    var extra = item.sob_consulta ? '<span class="item-lista-tema ok">Orçamento sob consulta</span>' : '';
    return '<div class="item-lista"><div class="item-lista-info">' +
      '<strong>' + item.nome + '</strong>' +
      '<span class="item-lista-cat">' + item.categoria + '</span>' + extra +
      '</div><button type="button" class="btn-remover-item" onclick="removerItem(' + i + ')" ' +
      'aria-label="Remover item"><i class="fas fa-trash-alt"></i></button></div>';
  }).join('');
  document.getElementById('modal-lista').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharModalLista() {
  var m = document.getElementById('modal-lista');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

// ============================================================
// 6. ENVIAR NO WHATSAPP — monta a URL com os itens da lista
// ============================================================
function finalizarCompraZap() {
  var carrinho = lerCarrinho();
  if (carrinho.length === 0) { mostrarToast('Sua lista está vazia', 'erro'); return; }

  var linhas = ['Olá Sheila! Vim pelo site e montei minha lista:', ''];
  carrinho.forEach(function (item, i) {
    linhas.push((i + 1) + '. ' + item.categoria + ' - ' + item.nome + (item.sob_consulta ? ' (sob consulta)' : ''));
  });
  linhas.push('');
  linhas.push(FRASE_FINAL);

  var url = 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(linhas.join('\n'));
  trackEvent('clique_whatsapp', { origem: 'finalizar_pedido', itens: carrinho.length });
  window.open(url, '_blank');
  fecharModalLista();
}

// ============================================================
// 7. CONTADOR + BARRA FIXA DE ACAO NO MOBILE
// ============================================================
function injetarBarraMobile() {
  if (document.getElementById('mbar')) return;
  var bar = document.createElement('div');
  bar.id = 'mbar';
  bar.className = 'mbar';
  bar.innerHTML =
    '<button type="button" class="mbar-lista" onclick="mostrarLista()" hidden>' +
      '<i class="fas fa-clipboard-list"></i> Minha Lista <span class="mbar-n">0</span></button>' +
    '<a class="mbar-zap" href="https://wa.me/' + ZAP + '?text=' + encodeURIComponent(MSG_PADRAO) +
      '" target="_blank" rel="noopener" data-zap="mbar"><i class="fab fa-whatsapp"></i> <span>Fale conosco</span></a>';
  document.body.appendChild(bar);
}

function atualizarContador() {
  var n = lerCarrinho().length;

  document.querySelectorAll('.floating-bar').forEach(function (b) { b.style.display = n > 0 ? 'flex' : 'none'; });
  document.querySelectorAll('.contador, .mbar-n').forEach(function (c) { c.textContent = n; });
  document.querySelectorAll('.sacola-float').forEach(function (s) { s.title = 'Ver minha lista'; });

  var mb = document.getElementById('mbar');
  if (!mb) return;
  var btn = mb.querySelector('.mbar-lista');
  var zap = mb.querySelector('.mbar-zap');
  btn.hidden = n === 0;
  mb.classList.toggle('has-list', n > 0);
  zap.querySelector('span').textContent = n > 0 ? 'Enviar lista' : 'Fale conosco';
  if (n > 0) {
    zap.setAttribute('href', '#');
    zap.onclick = function (e) { e.preventDefault(); finalizarCompraZap(); };
  } else {
    zap.onclick = null;
    zap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(MSG_PADRAO));
  }
}

// ============================================================
// 8. GALERIA DE TEMAS (temas.html) — vitrine, sem selecao
// ============================================================
function renderizarTemas() {
  if (typeof TEMAS === 'undefined') return;
  var tabsDiv = document.getElementById('tabs');
  var conteudoDiv = document.getElementById('conteudo-temas');
  if (!tabsDiv || !conteudoDiv) return;

  TEMAS.forEach(function (tema) {
    var btn = document.createElement('button');
    btn.className = 'tab-link';
    btn.type = 'button';
    btn.textContent = tema.label;
    btn.onclick = function (e) { abrirTab(e, tema.id); };
    tabsDiv.appendChild(btn);

    var div = document.createElement('div');
    div.id = tema.id;
    div.className = 'tab-content';
    div.innerHTML = '<div class="grid-container">' + tema.imagens.map(function (img) {
      var id = img.replace(/\.[^.]+$/, '');
      return '<figure class="card"><img src="img/temas/' + tema.pasta + '/' + img +
        '" alt="Tema ' + id + '" loading="lazy" decoding="async"><figcaption>' + id + '</figcaption></figure>';
    }).join('') + '</div>';
    conteudoDiv.appendChild(div);
  });

  if (tabsDiv.firstChild) tabsDiv.firstChild.click();
}

function abrirTab(evt, nomeTema) {
  document.querySelectorAll('.tab-content').forEach(function (el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab-link').forEach(function (el) { el.classList.remove('active'); });
  var alvo = document.getElementById(nomeTema);
  if (alvo) alvo.style.display = 'block';
  if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
  if (window.innerWidth <= 768 && alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarBotaoTopo() {
  var btn = document.getElementById('btn-topo');
  if (!btn) return;
  btn.style.display = (document.documentElement.scrollTop > 300) ? 'block' : 'none';
}
function subirTopo() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ============================================================
// 9. INICIALIZACAO
// ============================================================
window.addEventListener('scroll', mostrarBotaoTopo);

window.addEventListener('load', function () {
  injetarModalLista();
  injetarBarraMobile();
  renderizarTemas();
  atualizarContador();

  // a sacola do desktop abre o modal da lista
  document.querySelectorAll('.sacola-float').forEach(function (s) { s.onclick = mostrarLista; });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharModalLista(); });

  // Tracking de cliques
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me|whatsapp/i.test(href)) {
      trackEvent('clique_whatsapp', { origem: a.dataset.zap || 'link', destino: href.slice(0, 60) });
    } else if (/paginas-produtos\//i.test(href)) {
      trackEvent('ver_produto', { item: (a.textContent || '').trim().slice(0, 40), destino: href });
    }
  });

  // Reveal no scroll
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add('in'); });
  }
});
