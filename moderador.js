// ==========================================
// MÓDULO DO PAINEL DO MODERADOR: moderador.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa os ícones do Lucide, se disponíveis
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Carrega os dados iniciais ao abrir a página
    carregarPedidosAjudaNaTela();
    carregarHistoricoMensagensNaTela();
});

// Alternar entre as abas do painel (Ajuda / Mensagens Diárias)
function mudarAba(aba) {
    const painelAjuda = document.getElementById('painel-ajuda');
    const painelMensagens = document.getElementById('painel-mensagens');
    const btnAjuda = document.getElementById('btn-aba-ajuda');
    const btnMensagens = document.getElementById('btn-aba-mensagens');

    if (!painelAjuda || !painelMensagens || !btnAjuda || !btnMensagens) return;

    if (aba === 'ajuda') {
        painelAjuda.classList.remove('hidden');
        painelMensagens.classList.add('hidden');

        btnAjuda.className = "flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-emerald-700 text-white shadow-sm cursor-pointer";
        btnMensagens.className = "flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all text-slate-600 hover:bg-slate-100 cursor-pointer";
        
        carregarPedidosAjudaNaTela();
    } else {
        painelAjuda.classList.add('hidden');
        painelMensagens.classList.remove('hidden');

        btnMensagens.className = "flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-emerald-700 text-white shadow-sm cursor-pointer";
        btnAjuda.className = "flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all text-slate-600 hover:bg-slate-100 cursor-pointer";
        
        carregarHistoricoMensagensNaTela();
    }
}

// ==========================================
// GERENCIAMENTO DE PEDIDOS DE AJUDA
// ==========================================
async function carregarPedidosAjudaNaTela() {
    const container = document.getElementById('lista-pedidos');
    if (!container) return;

    container.innerHTML = `<p class="text-center text-slate-500 py-6">Carregando pedidos de ajuda do servidor...</p>`;

    const dadosGlobais = await buscarDadosAjudaServidor();
    
    // Blindagem de segurança: garante que a lista de pedidos seja sempre um Array válido
    const listaPedidos = (dadosGlobais && Array.isArray(dadosGlobais.pedidos)) ? dadosGlobais.pedidos : [];

    if (listaPedidos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/60">
                <p class="text-slate-500 text-sm">Nenhum pedido de ajuda pendente no momento.</p>
            </div>`;
        return;
    }

    container.innerHTML = "";
    // Cria uma cópia invertida para exibir os mais recentes primeiro sem alterar o array original
    const pedidosInvertidos = [...listaPedidos].reverse();

    pedidosInvertidos.forEach((pedido, index) => {
        const idReal = listaPedidos.length - 1 - index; // Índice real correspondente no array original
        const statusBadge = pedido.respondido 
            ? `<span class="text-xs font-bold text-emerald-700 uppercase tracking-wide bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Respondido</span>`
            : `<span class="text-xs font-bold text-amber-700 uppercase tracking-wide bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">Pendente de Resposta</span>`;

        const card = document.createElement('div');
        card.className = "bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs";
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    ${statusBadge}
                    <h3 class="font-bold text-slate-900 text-base mt-2">${pedido.nome || 'Anônimo'} <span class="text-xs font-normal text-slate-500">(${pedido.contato || 'Sem contato'})</span></h3>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400">${pedido.data || ''}</span>
                    <button onclick="apagarPedidoAjuda(${idReal})" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer" title="Apagar pedido">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <p class="text-slate-700 text-sm bg-white p-4 rounded-xl border border-slate-200/60 font-light leading-relaxed">
                "${pedido.mensagem || ''}"
            </p>
            
            ${pedido.respostaModerador ? `
                <div class="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-1">
                    <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">Resposta Enviada:</span>
                    <p class="text-slate-700 text-sm font-light">${pedido.respostaModerador}</p>
                </div>
            ` : ''}

            <!-- Bloco de Resposta do Moderador -->
            <div class="pt-2 space-y-2">
                <textarea id="resposta-${idReal}" rows="2" placeholder="Escreva uma palavra de conforto ou orientação..." class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600">${pedido.respostaModerador || ''}</textarea>
                <div class="flex justify-end">
                    <button onclick="enviarRespostaAjuda(${idReal})" class="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i> ${pedido.respostaModerador ? 'Atualizar Resposta' : 'Enviar Resposta'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function enviarRespostaAjuda(index) {
    const campoResposta = document.getElementById(`resposta-${index}`);
    if (!campoResposta) return;

    const textoResposta = campoResposta.value.trim();
    if (!textoResposta) {
        alert("Por favor, escreva uma resposta antes de enviar.");
        return;
    }

    const dadosGlobais = await buscarDadosAjudaServidor();
    if (!dadosGlobais || !Array.isArray(dadosGlobais.pedidos)) {
        alert("Erro ao conectar com o servidor.");
        return;
    }

    dadosGlobais.pedidos[index].respostaModerador = textoResposta;
    dadosGlobais.pedidos[index].respondido = true;

    const sucesso = await salvarDadosAjudaServidor(dadosGlobais);
    if (sucesso) {
        alert("Resposta enviada com sucesso!");
        carregarPedidosAjudaNaTela();
    } else {
        alert("Erro ao salvar a resposta no servidor.");
    }
}

async function apagarPedidoAjuda(index) {
    if (!confirm("Deseja realmente apagar este pedido de ajuda?")) return;

    const dadosGlobais = await buscarDadosAjudaServidor();
    if (!dadosGlobais || !Array.isArray(dadosGlobais.pedidos)) return;

    dadosGlobais.pedidos.splice(index, 1);

    const sucesso = await salvarDadosAjudaServidor(dadosGlobais);
    if (sucesso) {
        alert("Pedido apagado com sucesso.");
        carregarPedidosAjudaNaTela();
    } else {
        alert("Erro ao apagar o pedido.");
    }
}


// ==========================================
// GERENCIAMENTO DE MENSAGENS DIÁRIAS (ILIMITADO)
// ==========================================
async function publicarMensagemDiaria(event) {
    event.preventDefault();
    const tituloInput = document.getElementById('titulo-msg');
    const textoInput = document.getElementById('texto-msg');

    if (!tituloInput || !textoInput) return;

    const titulo = tituloInput.value.trim();
    const texto = textoInput.value.trim();

    if (!titulo || !texto) {
        alert("Preencha todos os campos.");
        return;
    }

    // Busca dados do banco principal
    const resultadoBanco = await buscarDadosDoBanco();
    const todosOsDados = resultadoBanco ? resultadoBanco.todosOsDados : {};

    // Garante que o array de mensagens do autor exista
    if (!Array.isArray(todosOsDados.mensagensDoAutor)) {
        todosOsDados.mensagensDoAutor = [];
    }

    const novaMensagem = {
        id: Date.now(),
        titulo: titulo,
        texto: texto,
        data: new Date().toLocaleDateString('pt-BR')
    };

    todosOsDados.mensagensDoAutor.push(novaMensagem);

    // Salva de volta no Bin Principal (API_URL definido em adm_config.js)
    try {
        const respostaPut = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify(todosOsDados)
        });

        if (!respostaPut.ok) throw new Error(`Erro: ${respostaPut.status}`);

        alert("Mensagem diária publicada com sucesso!");
        event.target.reset();
        carregarHistoricoMensagensNaTela();
    } catch (error) {
        console.error("Erro ao publicar mensagem diária:", error);
        alert("Erro ao salvar mensagem no servidor.");
    }
}

async function carregarHistoricoMensagensNaTela() {
    const container = document.getElementById('historico-mensagens');
    if (!container) return;

    container.innerHTML = `<p class="text-xs text-slate-500">Carregando histórico...</p>`;

    const resultadoBanco = await buscarDadosDoBanco();
    
    // Blindagem de segurança: garante que as mensagens do autor sejam sempre um Array válido
    const listaMensagens = (resultadoBanco && Array.isArray(resultadoBanco.mensagemDoAutor)) 
        ? resultadoBanco.mensagemDoAutor 
        : [];

    if (listaMensagens.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 italic">Nenhuma mensagem diária cadastrada ainda.</p>`;
        return;
    }

    container.innerHTML = "";
    // Cria uma cópia invertida para exibir as mais recentes no topo
    const mensagensInvertidas = [...listaMensagens].reverse();

    mensagensInvertidas.forEach((msg, idx) => {
        const indexReal = listaMensagens.length - 1 - idx;
        
        const item = document.createElement('div');
        item.className = "bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex justify-between items-center gap-4";
        item.innerHTML = `
            <div>
                <h4 class="font-semibold text-slate-800 text-sm">${msg.titulo || 'Sem título'}</h4>
                <p class="text-slate-600 text-xs mt-0.5 line-clamp-1">${msg.texto || ''}</p>
                <span class="text-[10px] text-slate-400">Publicado em: ${msg.data || 'Data não registrada'}</span>
            </div>
            <button onclick="apagarMensagemDiaria(${indexReal})" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer shrink-0" title="Apagar mensagem">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        container.appendChild(item);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function apagarMensagemDiaria(index) {
    if (!confirm("Deseja realmente apagar esta mensagem diária?")) return;

    const resultadoBanco = await buscarDadosDoBanco();
    if (!resultadoBanco || !resultadoBanco.todosOsDados || !Array.isArray(resultadoBanco.todosOsDados.mensagensDoAutor)) return;

    resultadoBanco.todosOsDados.mensagensDoAutor.splice(index, 1);

    try {
        const respostaPut = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify(resultadoBanco.todosOsDados)
        });

        if (!respostaPut.ok) throw new Error(`Erro: ${respostaPut.status}`);

        alert("Mensagem apagada com sucesso!");
        carregarHistoricoMensagensNaTela();
    } catch (error) {
        console.error("Erro ao apagar mensagem:", error);
        alert("Erro ao atualizar o servidor.");
    }
}
