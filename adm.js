// ==========================================
// PAINEL ADMINISTRATIVO - adm.js
// ==========================================

// Carregar credenciais salvas no localStorage ou usar os valores padrão
let ID_VALIDO = localStorage.getItem('adm_id') || "203077";
let SENHA_VALIDA = localStorage.getItem('adm_senha') || "099190";
let NOME_ADM = localStorage.getItem('adm_apelido') || "Leandro";

let dbPrincipalGlobal = {};
let dbAjudaGlobal = {};
let relatorioAtualModal = { dataKey: null, index: null };
let hojeIso = obterChaveDataHoje();

document.addEventListener('DOMContentLoaded', () => {
    atualizarNomeAdmUI();
    if (document.getElementById('label-data-hoje')) {
        document.getElementById('label-data-hoje').textContent = hojeIso.split('-').reverse().join('/');
    }

    lucide.createIcons();
    if (localStorage.getItem('logado_adm') === 'true') {
        liberarPainel();
    }
});

function atualizarNomeAdmUI() {
    if (document.getElementById('nome-adm-logado')) {
        document.getElementById('nome-adm-logado').textContent = NOME_ADM;
        document.getElementById('modal-nome-adm').textContent = NOME_ADM;
    }
}

function fazerLogin() {
    const idDigitado = document.getElementById('input-id').value.trim();
    const senhaDigitada = document.getElementById('input-senha').value.trim();
    const erroEl = document.getElementById('erro-login');

    if (idDigitado === ID_VALIDO && senhaDigitada === SENHA_VALIDA) {
        localStorage.setItem('logado_adm', 'true');
        liberarPainel();
    } else {
        erroEl.classList.remove('hidden');
    }
}

function fazerLogout() {
    localStorage.removeItem('logado_adm');
    document.getElementById('painel-admin').classList.add('hidden');
    document.getElementById('tela-login').classList.remove('hidden');
    document.getElementById('input-id').value = '';
    document.getElementById('input-senha').value = '';
}

async function liberarPainel() {
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('painel-admin').classList.remove('hidden');

    await carregarDadosServidorGeral();

    if (document.getElementById('video-nova-data')) {
        document.getElementById('video-nova-data').value = hojeIso;
    }
    
    // Preencher inputs de configuração
    document.getElementById('config-apelido').value = NOME_ADM;
    document.getElementById('config-id').value = ID_VALIDO;
    document.getElementById('config-senha').value = SENHA_VALIDA;

    lucide.createIcons();
}

async function carregarDadosServidorGeral() {
    try {
        const resPrincipal = await buscarDadosDoBanco();
        if (resPrincipal) {
            dbPrincipalGlobal = resPrincipal.todosOsDados || {};
        }

        const resAjuda = await buscarDadosAjudaServidor();
        if (resAjuda) {
            dbAjudaGlobal = resAjuda;
        }

        limparMensagensDiasAntigos();
        carregarListaVideosCards();
        carregarMensagensDiaAtual();
        carregarAutor();
        carregarRelatosAjuda();

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Envio automático em tempo real para o JSONBin Principal
async function sincronizarBinPrincipal() {
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify(dbPrincipalGlobal)
        });
    } catch (e) {
        console.error("Erro ao sincronizar bin principal:", e);
    }
}

// Envio automático em tempo real para o JSONBin de Ajuda
async function sincronizarBinAjuda() {
    try {
        await salvarDadosAjudaServidor(dbAjudaGlobal);
    } catch (e) {
        console.error("Erro ao sincronizar bin de ajuda:", e);
    }
}

function limparMensagensDiasAntigos() {
    Object.keys(dbPrincipalGlobal).forEach(key => {
        if (key !== 'mensagensDoAutor' && key !== hojeIso) {
            if (dbPrincipalGlobal[key] && dbPrincipalGlobal[key].mensagensDoDia) {
                dbPrincipalGlobal[key].mensagensDoDia = [];
            }
        }
    });
}

function mudarAba(aba) {
    const abas = ['video', 'mensagens', 'autor', 'ajuda', 'config'];
    abas.forEach(a => {
        const btn = document.getElementById(`btn-${a}`);
        const sec = document.getElementById(`aba-${a}`);
        if (a === aba) {
            btn.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-accent bg-emerald-500/10 text-accent transition w-24";
            sec.classList.remove('hidden');
        } else {
            btn.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-800 bg-cardBg text-gray-400 hover:text-white transition w-24";
            sec.classList.add('hidden');
        }
    });
}

// --- ABA 1: VÍDEOS ---
function carregarListaVideosCards() {
    const container = document.getElementById('lista-cards-videos');
    if (!container) return;
    container.innerHTML = '';

    const datas = Object.keys(dbPrincipalGlobal).filter(k => k !== 'mensagensDoAutor').sort().reverse();
    let temVideos = false;

    datas.forEach(dataKey => {
        const diaObj = dbPrincipalGlobal[dataKey];
        if (diaObj && diaObj.videoDoDia && diaObj.videoDoDia.youtubeId) {
            temVideos = true;
            const vid = diaObj.videoDoDia;
            container.innerHTML += `
                <div class="bg-black/30 border border-gray-800 p-4 rounded-xl flex flex-col justify-between space-y-2">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/25">${dataKey.split('-').reverse().join('/')}</span>
                        <button onclick="apagarVideoData('${dataKey}')" class="text-red-400 hover:text-red-300 p-1" title="Apagar Vídeo">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-100">${vid.titulo || 'Sem Título'}</h4>
                        <p class="text-xs text-gray-400 line-clamp-2 mt-1">${vid.descricao || 'Sem descrição.'}</p>
                    </div>
                    <div class="text-[11px] text-gray-500 font-mono">ID: ${vid.youtubeId}</div>
                </div>
            `;
        }
    });

    if (!temVideos) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic col-span-2">Nenhum vídeo cadastrado no momento.</p>';
    }
    lucide.createIcons();
}

async function adicionarOuAtualizarVideo() {
    const data = document.getElementById('video-nova-data').value;
    const titulo = document.getElementById('video-novo-titulo').value.trim();
    const youtubeId = document.getElementById('video-novo-id').value.trim();
    const descricao = document.getElementById('video-nova-descricao').value.trim();

    if (!data || !titulo || !youtubeId) {
        alert('Preencha a data, o título e o YouTube ID.');
        return;
    }

    if (dbPrincipalGlobal[data] && dbPrincipalGlobal[data].videoDoDia && dbPrincipalGlobal[data].videoDoDia.youtubeId) {
        if (!confirm(`Já existe um vídeo cadastrado para a data ${data}. Deseja substituí-lo?`)) {
            return;
        }
    }

    if (!dbPrincipalGlobal[data]) {
        dbPrincipalGlobal[data] = {
            "resumoDiario": { "data": data.split('-').reverse().join('/') },
            "mensagensDoDia": []
        };
    }

    dbPrincipalGlobal[data].videoDoDia = {
        "titulo": titulo,
        "descricao": descricao,
        "youtubeId": youtubeId
    };

    document.getElementById('video-novo-titulo').value = '';
    document.getElementById('video-novo-id').value = '';
    document.getElementById('video-nova-descricao').value = '';

    carregarListaVideosCards();
    await sincronizarBinPrincipal();
    alert('Vídeo postado e atualizado no servidor com sucesso!');
}

async function apagarVideoData(dataKey) {
    if (confirm(`Deseja apagar o vídeo da data ${dataKey}?`)) {
        if (dbPrincipalGlobal[dataKey] && dbPrincipalGlobal[dataKey].videoDoDia) {
            dbPrincipalGlobal[dataKey].videoDoDia = { "titulo": "", "descricao": "", "youtubeId": "" };
            carregarListaVideosCards();
            await sincronizarBinPrincipal();
            alert('Vídeo apagado do servidor com sucesso.');
        }
    }
}

// --- ABA 2: MENSAGENS DO DIA ---
function carregarMensagensDiaAtual() {
    const container = document.getElementById('lista-mensagens-dia');
    if (!container) return;
    container.innerHTML = '';

    if (!dbPrincipalGlobal[hojeIso] || !dbPrincipalGlobal[hojeIso].mensagensDoDia || dbPrincipalGlobal[hojeIso].mensagensDoDia.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic col-span-2">Nenhuma mensagem cadastrada para hoje.</p>';
        return;
    }

    let lista = [...dbPrincipalGlobal[hojeIso].mensagensDoDia].reverse();

    lista.forEach((msg, indexOriginalInverso) => {
        let indexReal = dbPrincipalGlobal[hojeIso].mensagensDoDia.length - 1 - indexOriginalInverso;
        let reacoes = msg.reacoes || { coracao: 0, amem: 0, flor: 0 };

        container.innerHTML += `
            <div class="bg-black/30 border border-gray-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/25">🕒 ${msg.horario}</span>
                    <button onclick="removerMensagemDia(${indexReal})" class="text-red-400 hover:text-red-300 p-1" title="Excluir Mensagem">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-100 font-medium">${msg.texto}</p>
                <div class="flex items-center gap-3 pt-2 border-t border-gray-800/60 text-xs text-gray-400">
                    <span class="flex items-center gap-1">❤️ ${reacoes.coracao || 0}</span>
                    <span class="flex items-center gap-1">🙏 ${reacoes.amem || 0}</span>
                    <span class="flex items-center gap-1">🌸 ${reacoes.flor || 0}</span>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

async function adicionarMensagemDia() {
    const texto = document.getElementById('nova-msg-texto').value.trim();
    const horarioAutomatico = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (!texto) {
        alert('Digite o texto da mensagem.');
        return;
    }

    if (!dbPrincipalGlobal[hojeIso]) {
        dbPrincipalGlobal[hojeIso] = { "mensagensDoDia": [], "resumoDiario": { "data": hojeIso.split('-').reverse().join('/') } };
    }
    if (!dbPrincipalGlobal[hojeIso].mensagensDoDia) {
        dbPrincipalGlobal[hojeIso].mensagensDoDia = [];
    }

    dbPrincipalGlobal[hojeIso].mensagensDoDia.push({
        "texto": texto,
        "horario": horarioAutomatico,
        "dataIso": hojeIso,
        "reacoes": { "coracao": 0, "amem": 0, "flor": 0 }
    });

    document.getElementById('nova-msg-texto').value = '';
    carregarMensagensDiaAtual();
    await sincronizarBinPrincipal();
}

async function removerMensagemDia(index) {
    if (confirm('Deseja excluir esta mensagem?')) {
        if (dbPrincipalGlobal[hojeIso] && dbPrincipalGlobal[hojeIso].mensagensDoDia) {
            dbPrincipalGlobal[hojeIso].mensagensDoDia.splice(index, 1);
            carregarMensagensDiaAtual();
            await sincronizarBinPrincipal();
        }
    }
}

// --- ABA 3: MENSAGEM DO AUTOR ---
function carregarAutor() {
    const autorObj = dbPrincipalGlobal.mensagensDoAutor || { autor: "", data: hojeIso, texto: "" };
    if (document.getElementById('autor-nome')) {
        document.getElementById('autor-nome').value = autorObj.autor;
        document.getElementById('autor-data').value = hojeIso;
        document.getElementById('autor-texto').value = autorObj.texto;
    }
}

async function publicarNovaAutor() {
    const nome = document.getElementById('autor-nome').value.trim();
    const texto = document.getElementById('autor-texto').value.trim();

    if (!nome || !texto) {
        alert('Preencha o nome do autor e o texto.');
        return;
    }

    dbPrincipalGlobal.mensagensDoAutor = {
        "autor": nome,
        "data": hojeIso,
        "texto": texto
    };
    document.getElementById('autor-data').value = hojeIso;
    await sincronizarBinPrincipal();
    alert('Mensagem do autor postada e sincronizada no servidor!');
}

async function excluirMensagemAutor() {
    if (confirm('Deseja realmente limpar/excluir a mensagem do autor?')) {
        dbPrincipalGlobal.mensagensDoAutor = { "autor": "", "data": hojeIso, "texto": "" };
        carregarAutor();
        await sincronizarBinPrincipal();
        alert('Mensagem do autor excluída e sincronizada.');
    }
}

// --- ABA 4: PEDIDOS DE AJUDA ---
function carregarRelatosAjuda() {
    const container = document.getElementById('lista-relatos');
    if (!container) return;
    container.innerHTML = '';

    let todosRelatos = [];
    Object.keys(dbAjudaGlobal).forEach(dataKey => {
        let relatos = dbAjudaGlobal[dataKey].relatosAjuda || [];
        relatos.forEach((relato, index) => {
            todosRelatos.push({ ...relato, dataKey, indexOriginal: index });
        });
    });

    todosRelatos.sort((a, b) => {
        let tA = a.timestamp || new Date(a.dataHora.split(' às ')[0].split('/').reverse().join('-')).getTime();
        let tB = b.timestamp || new Date(b.dataHora.split(' às ')[0].split('/').reverse().join('-')).getTime();
        return tB - tA;
    });

    if (todosRelatos.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic">Nenhum pedido de ajuda encontrado.</p>';
        return;
    }

    todosRelatos.forEach((item) => {
        let statusResposta = item.resposta ? `<span class="text-emerald-400 text-xs flex items-center gap-1 font-medium"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Respondido</span>` : `<span class="text-amber-400 text-xs flex items-center gap-1 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Pendente</span>`;
        
        container.innerHTML += `
            <div class="bg-black/30 hover:bg-black/45 transition p-4 rounded-xl border border-gray-800 space-y-3 shadow-sm flex flex-col justify-between cursor-pointer" onclick="abrirModalResposta('${item.dataKey}', ${item.indexOriginal}, '${item.texto.replace(/'/g, "\\'")}', '${(item.resposta || '').replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800/60 pb-2">
                    <span class="font-semibold text-emerald-400 flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5"></i> ${item.autor} <span class="text-gray-500 font-normal">(${item.dataKey.includes('-') ? item.dataKey.split('-').reverse().join('/') : item.dataKey})</span></span>
                    <div class="flex items-center gap-3">
                        <span>${item.dataHora || ''}</span>
                        <button onclick="event.stopPropagation(); excluirRelato('${item.dataKey}', ${item.indexOriginal})" class="text-red-400 hover:text-red-300" title="Excluir Relato">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-100 mb-2">${item.texto}</p>
                    ${item.resposta ? `<div class="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-300 mt-2"><strong>Resposta:</strong> ${item.resposta}</div>` : ''}
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-800/40">
                    <div>${statusResposta}</div>
                    <span class="text-xs text-accent flex items-center gap-1"><i data-lucide="message-square-text" class="w-3.5 h-3.5"></i> ${item.resposta ? 'Editar Resposta' : 'Responder'}</span>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

function abrirModalResposta(dataKey, index, textoViajante, respostaAtual) {
    relatorioAtualModal = { dataKey, index };
    document.getElementById('modal-texto-viajante').textContent = textoViajante;
    let textoLimpo = respostaAtual.includes(`— ${NOME_ADM}`) ? respostaAtual.replace(`— ${NOME_ADM}`, '').trim() : respostaAtual;
    document.getElementById('modal-input-resposta').value = textoLimpo;
    document.getElementById('modal-resposta').classList.remove('hidden');
    document.getElementById('modal-resposta').classList.add('flex');
}

function fecharModalResposta() {
    document.getElementById('modal-resposta').classList.remove('flex');
    document.getElementById('modal-resposta').classList.add('hidden');
}

async function salvarRespostaModal() {
    const { dataKey, index } = relatorioAtualModal;
    const textoResposta = document.getElementById('modal-input-resposta').value.trim();

    if (dataKey !== null && index !== null && dbAjudaGlobal[dataKey] && dbAjudaGlobal[dataKey].relatosAjuda[index]) {
        if (textoResposta !== "") {
            dbAjudaGlobal[dataKey].relatosAjuda[index].resposta = `${textoResposta} — ${NOME_ADM}`;
        } else {
            dbAjudaGlobal[dataKey].relatosAjuda[index].resposta = "";
        }
        carregarRelatosAjuda();
        fecharModalResposta();
        await sincronizarBinAjuda();
        alert('Resposta enviada e sincronizada com sucesso!');
    }
}

async function excluirRelato(dataKey, index) {
    if (confirm('Deseja excluir este pedido de ajuda?')) {
        dbAjudaGlobal[dataKey].relatosAjuda.splice(index, 1);
        carregarRelatosAjuda();
        await sincronizarBinAjuda();
    }
}

// --- ABA 5: CONFIGURAÇÕES DO ADM ---
function salvarConfiguracoesAdm() {
    const novoApelido = document.getElementById('config-apelido').value.trim();
    const novoId = document.getElementById('config-id').value.trim();
    const novaSenha = document.getElementById('config-senha').value.trim();

    if (!novoApelido || !novoId || !novaSenha) {
        alert('Preencha todos os campos de configuração.');
        return;
    }

    NOME_ADM = novoApelido;
    ID_VALIDO = novoId;
    SENHA_VALIDA = novaSenha;

    localStorage.setItem('adm_apelido', NOME_ADM);
    localStorage.setItem('adm_id', ID_VALIDO);
    localStorage.setItem('adm_senha', SENHA_VALIDA);

    atualizarNomeAdmUI();
    alert('Configurações atualizadas com sucesso!');
}
