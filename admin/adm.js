// ==========================================
// PAINEL ADMINISTRATIVO - adm.js (Tema Claro)
// ==========================================

let adminLogado = null; 
let dbPrincipalGlobal = {};
let dbAjudaGlobal = {};
let relatorioAtualModal = { dataKey: null, index: null };
let hojeIso = obterChaveDataHoje();

const SEO_MASTER = {
    id: "203077",
    senha: "099190",
    apelido: "Leandro",
    nivel: "seo"
};

document.addEventListener('DOMContentLoaded', async () => {
    await carregarEstruturaAdminsServidor();

    if (document.getElementById('label-data-hoje')) {
        document.getElementById('label-data-hoje').textContent = hojeIso.split('-').reverse().join('/');
    }

    lucide.createIcons();
    
    const admSalvoJson = localStorage.getItem('adm_sessao_atual');
    if (admSalvoJson) {
        adminLogado = JSON.parse(admSalvoJson);
        liberarPainel();
    }
});

async function carregarEstruturaAdminsServidor() {
    const resAjuda = await buscarDadosAjudaServidor();
    if (resAjuda) {
        dbAjudaGlobal = resAjuda;
    }

    if (!dbAjudaGlobal.configAdm) {
        dbAjudaGlobal.configAdm = {
            admins: [SEO_MASTER]
        };
        await salvarDadosAjudaServidor(dbAjudaGlobal);
    } else if (!dbAjudaGlobal.configAdm.admins) {
        dbAjudaGlobal.configAdm.admins = [SEO_MASTER];
    }
}

async function fazerLogin() {
    const idDigitado = document.getElementById('input-id').value.trim();
    const senhaDigitada = document.getElementById('input-senha').value.trim();
    const erroEl = document.getElementById('erro-login');

    await carregarEstruturaAdminsServidor();
    const listaAdmins = dbAjudaGlobal.configAdm.admins;

    const admEncontrado = listaAdmins.find(a => a.id === idDigitado && a.senha === senhaDigitada);

    if (admEncontrado) {
        adminLogado = admEncontrado;
        localStorage.setItem('adm_sessao_atual', JSON.stringify(adminLogado));
        erroEl.classList.add('hidden');
        liberarPainel();
    } else {
        erroEl.classList.remove('hidden');
    }
}

function fazerLogout() {
    localStorage.removeItem('adm_sessao_atual');
    adminLogado = null;
    document.getElementById('painel-admin').classList.add('hidden');
    document.getElementById('tela-login').classList.remove('hidden');
    document.getElementById('input-id').value = '';
    document.getElementById('input-senha').value = '';
}

async function liberarPainel() {
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('painel-admin').classList.remove('hidden');

    atualizarInterfacePorNivel();
    await carregarDadosServidorGeral();

    if (document.getElementById('video-nova-data')) {
        document.getElementById('video-nova-data').value = hojeIso;
    }

    lucide.createIcons();
}

function atualizarInterfacePorNivel() {
    if (!adminLogado) return;

    document.getElementById('nome-adm-logado').textContent = `${adminLogado.apelido} (${adminLogado.nivel.toUpperCase()})`;
    document.getElementById('modal-nome-adm').textContent = adminLogado.apelido;

    // Preenche os dados nos campos de edição de perfil próprio
    document.getElementById('meu-config-apelido').value = adminLogado.apelido;
    document.getElementById('meu-config-id').value = adminLogado.id;
    document.getElementById('meu-config-senha').value = '';

    const painelSeo = document.getElementById('painel-exclusivo-seo');

    if (adminLogado.nivel === 'seo') {
        painelSeo.classList.remove('hidden');
        carregarListaAdminsCadastrados();
    } else {
        painelSeo.classList.add('hidden');
    }
}

async function carregarDadosServidorGeral() {
    try {
        const resPrincipal = await buscarDadosDoBanco();
        if (resPrincipal) {
            dbPrincipalGlobal = resPrincipal.todosOsDados || {};
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

async function sincronizarBinPrincipal() {
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY, 'X-Access-Key': API_KEY },
            body: JSON.stringify(dbPrincipalGlobal)
        });
    } catch (e) {
        console.error("Erro ao sincronizar bin principal:", e);
    }
}

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
        if (!btn) return;
        
        if (a === aba) {
            if(a !== 'config'){
            btn.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 transition w-24 cursor-pointer shadow-sm";
            }
            if(sec) sec.classList.remove('hidden');
        } else {
            if(a !== 'config'){
            btn.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition w-24 cursor-pointer";}
            if(sec) sec.classList.add('hidden');
        }
    });
}

// --- EDITAR PRÓPRIO PERFIL (Qualquer Admin ou SEO) ---
async function salvarMeuPerfil() {
    const novoApelido = document.getElementById('meu-config-apelido').value.trim();
    const novoId = document.getElementById('meu-config-id').value.trim();
    const novaSenha = document.getElementById('meu-config-senha').value.trim();

    if (!novoApelido || !novoId) {
        alert('O apelido e o ID não podem ficar vazios.');
        return;
    }

    await carregarEstruturaAdminsServidor();
    const listaAdmins = dbAjudaGlobal.configAdm.admins;

    // Verifica se o ID novo já pertence a outra pessoa
    const idExistente = listaAdmins.find(a => a.id === novoId && a.id !== adminLogado.id);
    if (idExistente) {
        alert('Este ID já está em uso por outro administrador.');
        return;
    }

    // Localiza o adm atual na lista do servidor e atualiza
    const index = listaAdmins.findIndex(a => a.id === adminLogado.id || a.apelido === adminLogado.apelido);
    if (index !== -1) {
        listaAdmins[index].apelido = novoApelido;
        listaAdmins[index].id = novoId;
        if (novaSenha !== "") {
            listaAdmins[index].senha = novaSenha;
        }

        // Atualiza a sessão local
        adminLogado = listaAdmins[index];
        localStorage.setItem('adm_sessao_atual', JSON.stringify(adminLogado));

        await sincronizarBinAjuda();
        atualizarInterfacePorNivel();
        alert('Seus dados foram atualizados com sucesso!');
    }
}

// --- GERENCIAMENTO DE ADMINISTRADORES (Exclusivo SEO) ---
async function cadastrarNovoAdministrador() {
    const apelido = document.getElementById('novo-adm-apelido').value.trim();
    const id = document.getElementById('novo-adm-id').value.trim();
    const senha = document.getElementById('novo-adm-senha').value.trim();

    if (!apelido || !id || !senha) {
        alert('Preencha todos os campos para cadastrar o administrador.');
        return;
    }

    if (!dbAjudaGlobal.configAdm) dbAjudaGlobal.configAdm = { admins: [] };
    if (!dbAjudaGlobal.configAdm.admins) dbAjudaGlobal.configAdm.admins = [];

    const existe = dbAjudaGlobal.configAdm.admins.some(a => a.id === id);
    if (existe) {
        alert('Já existe um administrador cadastrado com este ID.');
        return;
    }

    dbAjudaGlobal.configAdm.admins.push({
        id: id,
        senha: senha,
        apelido: apelido,
        nivel: "administrador"
    });

    document.getElementById('novo-adm-apelido').value = '';
    document.getElementById('novo-adm-id').value = '';
    document.getElementById('novo-adm-senha').value = '';

    carregarListaAdminsCadastrados();
    await sincronizarBinAjuda();
    alert('Novo administrador cadastrado com sucesso!');
}

async function removerAdministrador(index) {
    if (confirm('Deseja remover este administrador?')) {
        dbAjudaGlobal.configAdm.admins.splice(index, 1);
        carregarListaAdminsCadastrados();
        await sincronizarBinAjuda();
        alert('Administrador removido com sucesso.');
    }
}

function carregarListaAdminsCadastrados() {
    const container = document.getElementById('lista-admins-cadastrados');
    if (!container) return;
    container.innerHTML = '';

    const admins = dbAjudaGlobal.configAdm.admins || [];
    admins.forEach((adm, index) => {
        let badgeNivel = adm.nivel === 'seo' ? '<span class="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded">SEO</span>' : '<span class="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">Administrador</span>';
        
        container.innerHTML += `
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center text-sm">
                <div>
                    <strong class="text-gray-900">${adm.apelido}</strong> 
                    <span class="text-xs text-gray-500 font-mono ml-2">(ID: ${adm.id})</span>
                    <div class="mt-1">${badgeNivel}</div>
                </div>
                ${adm.nivel !== 'seo' ? `<button onclick="removerAdministrador(${index})" class="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Excluir Administrador"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : '<span class="text-xs text-gray-400 italic">Principal</span>'}
            </div>
        `;
    });
    lucide.createIcons();
}

// --- VÍDEOS ---
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
                <div class="bg-white border border-gray-200 p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-sm">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${dataKey.split('-').reverse().join('/')}</span>
                        <button onclick="apagarVideoData('${dataKey}')" class="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Apagar Vídeo"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900">${vid.titulo || 'Sem Título'}</h4>
                        <p class="text-xs text-gray-600 line-clamp-2 mt-1">${vid.descricao || 'Sem descrição.'}</p>
                    </div>
                    <div class="text-[11px] text-gray-400 font-mono">ID: ${vid.youtubeId}</div>
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

    if (!dbPrincipalGlobal[data]) {
        dbPrincipalGlobal[data] = { "resumoDiario": { "data": data.split('-').reverse().join('/') }, "mensagensDoDia": [] };
    }

    dbPrincipalGlobal[data].videoDoDia = { "titulo": titulo, "descricao": descricao, "youtubeId": youtubeId };

    document.getElementById('video-novo-titulo').value = '';
    document.getElementById('video-novo-id').value = '';
    document.getElementById('video-nova-descricao').value = '';

    carregarListaVideosCards();
    await sincronizarBinPrincipal();
    alert('Vídeo postado com sucesso!');
}

async function apagarVideoData(dataKey) {
    if (confirm(`Deseja apagar o vídeo da data ${dataKey}?`)) {
        if (dbPrincipalGlobal[dataKey] && dbPrincipalGlobal[dataKey].videoDoDia) {
            dbPrincipalGlobal[dataKey].videoDoDia = { "titulo": "", "descricao": "", "youtubeId": "" };
            carregarListaVideosCards();
            await sincronizarBinPrincipal();
            alert('Vídeo apagado com sucesso.');
        }
    }
}

// --- MENSAGENS DO DIA ---
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
            <div class="bg-white border border-gray-200 p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">🕒 ${msg.horario}</span>
                    <button onclick="removerMensagemDia(${indexReal})" class="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Excluir Mensagem"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
                <p class="text-sm text-gray-900 font-medium">${msg.texto}</p>
                <div class="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
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

// --- MENSAGEM DO AUTOR ---
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

    dbPrincipalGlobal.mensagensDoAutor = { "autor": nome, "data": hojeIso, "texto": texto };
    document.getElementById('autor-data').value = hojeIso;
    await sincronizarBinPrincipal();
    alert('Mensagem do autor postada com sucesso!');
}

async function excluirMensagemAutor() {
    if (confirm('Deseja realmente limpar/excluir a mensagem do autor?')) {
        dbPrincipalGlobal.mensagensDoAutor = { "autor": "", "data": hojeIso, "texto": "" };
        carregarAutor();
        await sincronizarBinPrincipal();
        alert('Mensagem do autor excluída.');
    }
}

// --- PEDIDOS DE AJUDA ---
function carregarRelatosAjuda() {
    const container = document.getElementById('lista-relatos');
    if (!container) return;
    container.innerHTML = '';

    let todosRelatos = [];
    Object.keys(dbAjudaGlobal).forEach(dataKey => {
        if (dataKey === 'configAdm') return;
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
        let statusResposta = item.resposta ? `<span class="text-emerald-600 text-xs flex items-center gap-1 font-medium"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Respondido</span>` : `<span class="text-amber-600 text-xs flex items-center gap-1 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Pendente</span>`;
        
        container.innerHTML += `
            <div class="bg-white hover:bg-gray-50 transition p-4 rounded-xl border border-gray-200 space-y-3 shadow-sm flex flex-col justify-between cursor-pointer" onclick="abrirModalResposta('${item.dataKey}', ${item.indexOriginal}, '${item.texto.replace(/'/g, "\\'")}', '${(item.resposta || '').replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center text-xs text-gray-500 border-b border-gray-100 pb-2">
                    <span class="font-semibold text-blue-600 flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5"></i> ${item.autor} <span class="text-gray-400 font-normal">(${item.dataKey.includes('-') ? item.dataKey.split('-').reverse().join('/') : item.dataKey})</span></span>
                    <div class="flex items-center gap-3">
                        <span>${item.dataHora || ''}</span>
                        <button onclick="event.stopPropagation(); excluirRelato('${item.dataKey}', ${item.indexOriginal})" class="text-red-500 hover:text-red-700 cursor-pointer" title="Excluir Relato"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-800 mb-2">${item.texto}</p>
                    ${item.resposta ? `<div class="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-800 mt-2"><strong>Resposta:</strong> ${item.resposta}</div>` : ''}
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div>${statusResposta}</div>
                    <span class="text-xs text-blue-600 hover:underline flex items-center gap-1"><i data-lucide="message-square-text" class="w-3.5 h-3.5"></i> ${item.resposta ? 'Editar Resposta' : 'Responder'}</span>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

function abrirModalResposta(dataKey, index, textoViajante, respostaAtual) {
    relatorioAtualModal = { dataKey, index };
    document.getElementById('modal-texto-viajante').textContent = textoViajante;
    let textoLimpo = respostaAtual.includes(`— ${adminLogado.apelido}`) ? respostaAtual.replace(`— ${adminLogado.apelido}`, '').trim() : respostaAtual;
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
            dbAjudaGlobal[dataKey].relatosAjuda[index].resposta = `${textoResposta} — ${adminLogado.apelido}`;
        } else {
            dbAjudaGlobal[dataKey].relatosAjuda[index].resposta = "";
        }
        carregarRelatosAjuda();
        fecharModalResposta();
        await sincronizarBinAjuda();
        alert('Resposta enviada com sucesso!');
    }
}

async function excluirRelato(dataKey, index) {
    if (confirm('Deseja excluir este pedido de ajuda?')) {
        dbAjudaGlobal[dataKey].relatosAjuda.splice(index, 1);
        carregarRelatosAjuda();
        await sincronizarBinAjuda();
    }
}
