// js/script.js - v3.2
// Google Analytics — init centralizado (o <script async> de cada HTML carrega a lib)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MPB5QZX4X9');

// ============================================================
// 1. ADICIONAR PRODUTO (3 tipos: tema | nome | consulta)
// ============================================================
function escolherProduto(categoria, nomeProduto, tipo = 'tema') {
    
    // TIPO 3: Orçamento sob consulta - vai direto pro Zap
    if (tipo === 'consulta') {
        const telefone = "5522988241470";
        const msg = `Olá Sheila! 💛%0D%0AGostaria de um orçamento para: *${categoria}* - ${nomeProduto}.%0D%0AAguardo os detalhes. Obrigada! 🌸`;
        window.open(`https://wa.me/${telefone}?text=${msg}`, '_blank');
        return;
    }
    
    // TIPO 2: Só com nome - adiciona direto ao carrinho, sem passar por temas
    if (tipo === 'nome') {
        adicionarAoCarrinho({
            categoria: categoria,
            nome: nomeProduto,
            matriz: null,
            aguardando_tema: false
        });
        mostrarToast(`✅ ${nomeProduto} adicionado!`, 'sucesso');
        return;
    }
    
    // TIPO 1 (padrão): Com tema
    // Adiciona ao carrinho com flag "aguardando_tema: true".
    // A ordem FIFO é garantida: quem entrar primeiro, ganha tema primeiro.
    adicionarAoCarrinho({
        categoria: categoria,
        nome: nomeProduto,
        matriz: null,
        aguardando_tema: true
    });
    
    // Toast pendente pra mostrar ao chegar em temas.html
    sessionStorage.setItem('toast_pendente', `✅ ${nomeProduto} adicionado — agora escolha o tema`);
    
    window.location.href = '../temas.html';
}

// ============================================================
// 2. SELECIONAR TEMA - sempre aplica no PRIMEIRO item aguardando (FIFO)
// ============================================================
function selecionarMatriz(nomeMatriz) {
    let carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];

    // Pega sempre o primeiro item que está aguardando tema (FIFO)
    const indiceAlvo = carrinho.findIndex(item => item.aguardando_tema);

    if (indiceAlvo === -1) {
        alert("Ops! Por favor, escolha primeiro o produto (Toalha, Fralda...) no catálogo inicial.");
        window.location.href = 'index.html#catalogo';
        return;
    }

    // Aplica o tema no item
    carrinho[indiceAlvo].matriz = nomeMatriz;
    carrinho[indiceAlvo].aguardando_tema = false;
    sessionStorage.setItem('meu_carrinho', JSON.stringify(carrinho));

    atualizarContador();
    atualizarBarraTemaTopo();

    // Verifica se ainda tem outros itens aguardando tema
    const proximoAguardando = carrinho.findIndex(item => item.aguardando_tema);
    
    if (proximoAguardando !== -1) {
        atualizarBarraTemaTopo();
        mostrarToast(`✅ Tema aplicado! Agora escolha o tema para: ${carrinho[proximoAguardando].nome}`, 'info', 3500);
        return;
    }

    // Todos com tema: abre modal de sucesso
    const modal = document.getElementById('modal-sucesso');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        if (confirm("Item adicionado! Deseja finalizar o pedido no WhatsApp agora?")) {
            finalizarCompraZap();
        }
    }
}

// ============================================================
// 3. HELPER: adiciona item ao carrinho, retorna o índice
// ============================================================
function adicionarAoCarrinho(item) {
    let carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];
    carrinho.push(item);
    sessionStorage.setItem('meu_carrinho', JSON.stringify(carrinho));
    atualizarContador();
    return carrinho.length - 1;
}

// ============================================================
// 4. TOAST DESLIZANTE (vem do topo, some sozinho)
// ============================================================
function mostrarToast(mensagem, tipo = 'sucesso', duracao = 2500) {
    const antigo = document.getElementById('toast-atelier');
    if (antigo) antigo.remove();

    const cores = {
        sucesso: '#25D366',
        info:    '#E8B41B',
        erro:    '#ff4d4d'
    };

    const toast = document.createElement('div');
    toast.id = 'toast-atelier';
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-120%);
        background: ${cores[tipo] || cores.sucesso}; color: white;
        padding: 14px 22px; border-radius: 30px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25); z-index: 99999;
        font-weight: bold; font-size: 0.95rem; text-align: center;
        max-width: 90%; transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    `;
    toast.innerHTML = mensagem;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-120%)';
        setTimeout(() => toast.remove(), 500);
    }, duracao);
}

// ============================================================
// 5. BARRA FIXA NO TOPO DO temas.html: "Escolhendo tema para X"
// ============================================================
function atualizarBarraTemaTopo() {
    const barra = document.getElementById('barra-tema-topo');
    if (!barra) return;

    const carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];
    const aguardando = carrinho.find(item => item.aguardando_tema);

    if (aguardando) {
        barra.style.display = 'flex';
        barra.innerHTML = `<i class="fas fa-palette"></i> Escolhendo tema para: <strong>${aguardando.nome}</strong>`;
    } else {
        barra.style.display = 'none';
    }
}

// ============================================================
// 6. MODAL / NAVEGAÇÃO
// ============================================================
function fecharModalSucesso() {
    const modal = document.getElementById('modal-sucesso');
    if (modal) modal.style.display = 'none';
}

function irParaInicio() {
    window.location.href = 'index.html#catalogo';
}

// ============================================================
// 6b. MODAL LISTA — ver itens + remover individualmente
// ============================================================
function injetarModalLista() {
    const modal = document.createElement('div');
    modal.id = 'modal-lista';
    modal.className = 'modal-lista-overlay';
    modal.innerHTML = `
        <div class="modal-lista-content">
            <div class="modal-lista-header">
                <span>🛍️ Minha Lista</span>
                <span class="modal-lista-fechar" onclick="fecharModalLista()">&times;</span>
            </div>
            <div id="modal-lista-itens" class="modal-lista-itens"></div>
            <div class="modal-lista-footer">
                <button class="btn-continuar-lista" onclick="fecharModalLista()">Continuar escolhendo</button>
                <button id="btn-finalizar-lista" class="btn-finalizar-lista" onclick="finalizarCompraZap(); fecharModalLista();">
                    <i class="fab fa-whatsapp"></i> Enviar no WhatsApp
                </button>
            </div>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModalLista(); });
    document.body.appendChild(modal);

    const sacola = document.querySelector('.sacola-float');
    if (sacola) sacola.onclick = mostrarLista;
}

function mostrarLista() {
    const carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];

    if (carrinho.length === 0) {
        mostrarToast('Sua lista está vazia!', 'erro');
        return;
    }

    const container = document.getElementById('modal-lista-itens');
    const btnFinalizar = document.getElementById('btn-finalizar-lista');
    const temPendente = carrinho.some(item => item.aguardando_tema);

    container.innerHTML = carrinho.map((item, index) => {
        const temaHtml = item.aguardando_tema
            ? `<span class="item-lista-tema pendente">⏳ Falta escolher tema</span>`
            : item.matriz
                ? `<span class="item-lista-tema ok">🎨 ${item.matriz}</span>`
                : `<span class="item-lista-tema ok">✏️ Só com bordado do nome</span>`;

        return `
            <div class="item-lista">
                <div class="item-lista-info">
                    <strong>${item.nome}</strong>
                    <span class="item-lista-cat">${item.categoria}</span>
                    ${temaHtml}
                </div>
                <button class="btn-remover-item" onclick="removerItem(${index})" title="Remover item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    btnFinalizar.disabled = temPendente;
    btnFinalizar.style.opacity = temPendente ? '0.5' : '1';
    btnFinalizar.title = temPendente ? 'Escolha o tema de todos os itens antes de enviar' : 'Finalizar pedido no WhatsApp';

    document.getElementById('modal-lista').style.display = 'flex';
}

function fecharModalLista() {
    const modal = document.getElementById('modal-lista');
    if (modal) modal.style.display = 'none';
}

function removerItem(index) {
    let carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];
    carrinho.splice(index, 1);
    sessionStorage.setItem('meu_carrinho', JSON.stringify(carrinho));
    atualizarContador();
    atualizarBarraTemaTopo();

    if (carrinho.length === 0) {
        fecharModalLista();
        mostrarToast('Lista esvaziada!', 'info');
    } else {
        mostrarLista();
    }
}

// ============================================================
// 7. LIMPAR SACOLA
// ============================================================
function limparSacola() {
    if (confirm("Tem certeza que deseja limpar toda a sua lista de pedidos?")) {
        sessionStorage.removeItem('meu_carrinho');
        sessionStorage.removeItem('toast_pendente');
        atualizarContador();
        atualizarBarraTemaTopo();
        fecharModalSucesso();
    }
}

// ============================================================
// 8. FINALIZAR NO WHATSAPP (com bloqueio se houver item sem tema)
// ============================================================
function finalizarCompraZap() {
    let carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];

    if (carrinho.length === 0) {
        mostrarToast('Sua lista está vazia!', 'erro');
        return;
    }

    const semTema = carrinho.find(item => item.aguardando_tema);
    if (semTema) {
        mostrarToast(`⚠️ Ainda falta escolher tema para: ${semTema.nome}`, 'erro', 3500);
        fecharModalSucesso();
        if (!window.location.pathname.includes('temas')) {
            setTimeout(() => { window.location.href = 'temas.html'; }, 1200);
        }
        return;
    }

    let mensagem = "Olá Sheila! 💛%0D%0A%0D%0A";
    mensagem += "Gostaria de orçar os seguintes itens personalizados:%0D%0A%0D%0A";

    carrinho.forEach((item, index) => {
        mensagem += `*${index + 1}. ${item.categoria}* - ${item.nome}%0D%0A`;
        if (item.matriz) {
            mensagem += `   🎨 Tema: ${item.matriz}%0D%0A`;
        } else {
            mensagem += `   ✏️ Somente com bordado do nome%0D%0A`;
        }
        mensagem += "-----------------%0D%0A";
    });

    mensagem += "%0D%0AAguardo o valor e prazo de entrega. Obrigada! 🌸";

    const telefoneSheila = "5522988241470";
    window.open(`https://wa.me/${telefoneSheila}?text=${mensagem}`, '_blank');
    fecharModalSucesso();
}

// ============================================================
// 9. CONTADOR + ESTADO VISUAL DO BOTÃO FINALIZAR
// ============================================================
function atualizarContador() {
    const carrinho = JSON.parse(sessionStorage.getItem('meu_carrinho')) || [];
    const temItemSemTema = carrinho.some(item => item.aguardando_tema);

    const barras = document.querySelectorAll('.floating-bar');
    const contadores = document.querySelectorAll('.contador');
    const sacolas = document.querySelectorAll('.sacola-float');

    barras.forEach(barra => {
        barra.style.display = carrinho.length > 0 ? 'flex' : 'none';
    });

    contadores.forEach(cont => {
        cont.innerText = carrinho.length;
    });

    sacolas.forEach(sacola => {
        if (temItemSemTema) {
            sacola.style.opacity = '0.55';
            sacola.style.filter = 'grayscale(0.6)';
            sacola.title = 'Você ainda precisa escolher o tema de um item';
        } else {
            sacola.style.opacity = '1';
            sacola.style.filter = 'none';
            sacola.title = 'Finalizar pedido no WhatsApp';
        }
    });
}

// ============================================================
// 10. INICIALIZAÇÃO
// ============================================================
window.addEventListener('scroll', mostrarBotaoTopo);

window.addEventListener('load', function() {
    injetarModalLista();
    renderizarTemas();
    atualizarContador();
    atualizarBarraTemaTopo();

    const toastPendente = sessionStorage.getItem('toast_pendente');
    if (toastPendente) {
        mostrarToast(toastPendente, 'sucesso', 3000);
        sessionStorage.removeItem('toast_pendente');
    }

    const popupAgenda = document.getElementById('popup-agenda');
    if (popupAgenda && !sessionStorage.getItem('popupVisto')) {
        setTimeout(() => { popupAgenda.style.display = 'flex'; }, 1000);
        sessionStorage.setItem('popupVisto', 'true');
    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-sucesso');
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    iniciarDepoimentos();
});

function fecharPopup() {
    const popup = document.getElementById('popup-agenda');
    if (popup) popup.style.display = 'none';
}

function iniciarDepoimentos() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.testimonial-slide');

    if (slides.length > 0) {
        slides[0].classList.add('active');
        setInterval(() => {
            slides[slideIndex].classList.remove('active');
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].classList.add('active');
        }, 5000);
    }
}

// ============================================================
// 11. GALERIA DE TEMAS — renderização dinâmica
// ============================================================
function renderizarTemas() {
    if (typeof TEMAS === 'undefined') return;

    const tabsDiv = document.getElementById('tabs');
    const conteudoDiv = document.getElementById('conteudo-temas');
    if (!tabsDiv || !conteudoDiv) return;

    TEMAS.forEach(tema => {
        const btn = document.createElement('button');
        btn.className = 'tab-link';
        btn.textContent = tema.label;
        btn.onclick = (e) => abrirTab(e, tema.id);
        tabsDiv.appendChild(btn);

        const div = document.createElement('div');
        div.id = tema.id;
        div.className = 'tab-content';
        div.innerHTML = `<div class="grid-container">${
            tema.imagens.map(img => {
                const id = img.replace(/\.[^.]+$/, '');
                return `<div class="card">
                    <img src="img/temas/${tema.pasta}/${img}" alt="${id}" loading="lazy">
                    <p>${id}</p>
                    <button class="btn-dourado" onclick="selecionarMatriz('${id}')">Escolher</button>
                </div>`;
            }).join('')
        }</div>`;
        conteudoDiv.appendChild(div);
    });

    if (tabsDiv.firstChild) tabsDiv.firstChild.click();
}

function abrirTab(evt, nomeTema) {
    document.querySelectorAll('.tab-content').forEach(el => { el.style.display = 'none'; });
    document.querySelectorAll('.tab-link').forEach(el => { el.classList.remove('active'); });
    const alvo = document.getElementById(nomeTema);
    if (alvo) alvo.style.display = 'block';
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');

    if (window.innerWidth <= 768 && alvo) {
        alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function mostrarBotaoTopo() {
    const btn = document.getElementById('btn-topo');
    if (!btn) return;
    btn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? 'block' : 'none';
}

function subirTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}