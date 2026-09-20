// ==========================================
// PAINEL ADMINISTRATIVO - ADM.JS
// Integrado com eqz_db (MySQL via PHP/Config)
// ==========================================

let adminLogado = null;
let relatoIdAtual = null;

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ==========================================
// 1. SISTEMA DE LOGIN E SESSÃO
// ==========================================
async function fazerLogin() {
    const idInput = document.getElementById('input-id').value.trim();
    const senhaInput = document.getElementById('input-senha').value.trim();
    const erroLogin = document.getElementById('erro-login');

    if (!idInput || !senhaInput) {
        erroLogin.textContent = "Preencha o ID e a senha!";
        erroLogin.classList.remove('hidden');
        return;
    }

    const admins = await buscarTabela('admins');
    const adminEncontrado = admins.find(a => a.id == idInput && a.senha === senhaInput);

    if (adminEncontrado) {
        adminLogado = adminEncontrado;
        erroLogin.classList.add('hidden');

        document.getElementById('tela-login').classList.add('hidden');
        document.getElementById('painel-admin').classList.remove('hidden');
        document.getElementById('nome-adm-logado').textContent = adminEncontrado.apelido;

        // Se for o ID master "203077" ou SEO, mostra aba de gerenciar outros admins
        if (adminEncontrado.id == "203077" || adminEncontrado.nivel === 'SEO') {
           
            document.getElementById('painel-exclusivo-seo').classList.remove('hidden');
        }

        // Preenche dados de configuração do próprio perfil
        document.getElementById('meu-config-apelido').value = adminEncontrado.apelido;
        document.getElementById('meu-config-id').value = adminEncontrado.id;

        // Define a data de hoje nos inputs de data
        const hojeIso = new Date().toISOString().split('T')[0];
        const inputDataVideo = document.getElementById('video-nova-data');
        if (inputDataVideo) inputDataVideo.value = hojeIso;
        
        const labelDataHoje = document.getElementById('label-data-hoje');
        if (labelDataHoje) labelDataHoje.textContent = new Date().toLocaleDateString('pt-BR');

        // Carrega todas as seções
        inicializarPainel();
    } else {
        erroLogin.textContent = "ID ou senha incorretos!";
        erroLogin.classList.remove('hidden');
    }
}

function fazerLogout() {
    adminLogado = null;
    document.getElementById('painel-admin').classList.add('hidden');
    document.getElementById('tela-login').classList.remove('hidden');
    document.getElementById('input-senha').value = '';
}

// ==========================================
// 2. CONTROLE DE ABAS DA INTERFACE
// ==========================================
function abrirConfiguracoes() {
    mudarAba('config');
}
function mudarAba(nomeAba) {
    const abas = ['video', 'mensagens', 'autor', 'ajuda', 'config'];
    
    abas.forEach(aba => {
        const secao = document.getElementById(`aba-${aba}`);
        const btn = document.getElementById(`btn-${aba}`);
        if (secao) secao.classList.add('hidden');

        if (btn) {
           
            if(aba === 'config') {
                btn.className = "hidden";
            }else {
            btn.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition w-24 cursor-pointer";
            }
        }
    });

    const secaoAtiva = document.getElementById(`aba-${nomeAba}`);
    const btnAtivo = document.getElementById(`btn-${nomeAba}`);
    if (secaoAtiva) secaoAtiva.classList.remove('hidden');
    if (btnAtivo) {
 if(nomeAba === 'config') {
                btnAtivo.className = "hidden";
            }else {
        btnAtivo.className = "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 transition w-24 cursor-pointer shadow-sm";
            }
    }
}

// ==========================================
// 3. INICIALIZAÇÃO DE DADOS DO PAINEL
// ==========================================
async function inicializarPainel() {
    await Promise.all([
        carregarVideos(),
        carregarMensagensDia(),
        carregarMensagemAutor(),
        carregarRelatos(),
        carregarAdminsCadastrados()
    ]);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 4. VÍDEOS DO DIA
// ==========================================
async function carregarVideos() {
    const videos = await buscarTabela('videos_dia');
    const container = document.getElementById('lista-cards-videos');
    if (!container) return;

    container.innerHTML = '';
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-500 italic col-span-2">Nenhum vídeo cadastrado.</p>';
        return;
    }

    videos.forEach(v => {
        const div = document.createElement('div');
        div.className = "bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between space-y-2";
        div.innerHTML = `
            <div>
                <span class="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">${v.data}</span>
                <h4 class="text-sm font-bold text-gray-800 mt-1">${v.titulo}</h4>
                <p class="text-xs text-gray-600 line-clamp-2">${v.descricao || ''}</p>
                <p class="text-[11px] text-gray-400 mt-1">ID YouTube: ${v.youtube_id}</p>
            </div>
            <div class="flex justify-end pt-2 border-t border-gray-200">
                <button onclick="excluirVideo('${v.data}')" class="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 bg-white hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition cursor-pointer">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir
                </button>
            </div>
        `;
        container.appendChild(div);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function adicionarOuAtualizarVideo() {
    const data = document.getElementById('video-nova-data').value;
    const youtubeId = document.getElementById('video-novo-id').value.trim();
    const titulo = document.getElementById('video-novo-titulo').value.trim();
    const descricao = document.getElementById('video-nova-descricao').value.trim();

    if (!data || !youtubeId || !titulo) {
        alert("Preencha a data, o ID do YouTube e o título!");
        return;
    }

    const dados = {
        acao: 'salvar_video_dia',
        data: data,
        titulo: titulo,
        descricao: descricao,
        youtube_id: youtubeId
    };

    const res = await apiRequisicao('videos_dia', 'POST', dados);
    if (res && res.sucesso) {
        alert("Vídeo salvo com sucesso!");
        document.getElementById('video-novo-id').value = '';
        document.getElementById('video-novo-titulo').value = '';
        document.getElementById('video-nova-descricao').value = '';
        carregarVideos();
    } else {
        alert("Erro ao salvar vídeo.");
    }
}

async function excluirVideo(dataIso) {
    if (confirm("Deseja realmente excluir o vídeo desta data?")) {
        const dados = { acao: 'excluir_registro', tabela: 'videos_dia', id: dataIso };
        const res = await apiRequisicao('videos_dia', 'POST', dados);
        if (res && res.sucesso) carregarVideos();
    }
}

// ==========================================
// 5. MENSAGENS DO DIA
// ==========================================
async function carregarMensagensDia() {
    const mensagens = await buscarTabela('mensagens_dia');
    const container = document.getElementById('lista-mensagens-dia');
    if (!container) return;

    container.innerHTML = '';
    if (!mensagens || mensagens.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-500 italic col-span-2">Nenhuma mensagem cadastrada.</p>';
        return;
    }

    mensagens.forEach(m => {
        const div = document.createElement('div');
        div.className = "bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between space-y-2";
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-center text-[11px] text-gray-500 mb-1">
                    <span>Data: <strong>${m.data_iso}</strong></span>
                    <span>Hora: <strong>${m.horario}</strong></span>
                </div>
                <p class="text-xs text-gray-800">${m.texto}</p>
                <div class="flex gap-3 mt-2 text-[11px] text-gray-500">
                    <span>❤️ ${m.reacao_coracao || 0}</span>
                    <span>🙏 ${m.reacao_amem || 0}</span>
                    <span>🌸 ${m.reacao_flor || 0}</span>
                </div>
            </div>
            <div class="flex justify-end pt-2 border-t border-gray-200">
                <button onclick="excluirMensagemDia(${m.id})" class="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 bg-white hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition cursor-pointer">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir
                </button>
            </div>
        `;
        container.appendChild(div);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function adicionarMensagemDia() {
    const texto = document.getElementById('nova-msg-texto').value.trim();
    if (!texto) {
        alert("Escreva o texto da mensagem!");
        return;
    }

    const hojeIso = new Date().toISOString().split('T')[0];
    const dados = {
        acao: 'enviar_mensagem',
        texto: texto,
        dataIso: hojeIso
    };

    const res = await apiRequisicao('mensagens_dia', 'POST', dados);
    if (res && res.sucesso) {
        document.getElementById('nova-msg-texto').value = '';
        carregarMensagensDia();
    } else {
        alert("Erro ao enviar mensagem.");
    }
}

async function excluirMensagemDia(id) {
    if (confirm("Deseja excluir esta mensagem?")) {
        const dados = { acao: 'excluir_registro', tabela: 'mensagens_dia', id: id };
        const res = await apiRequisicao('mensagens_dia', 'POST', dados);
        if (res && res.sucesso) carregarMensagensDia();
    }
}

// ==========================================
// 6. MENSAGEM DO AUTOR
// ==========================================
async function carregarMensagemAutor() {
    const mensagens = await buscarTabela('mensagens_autor');
    if (!mensagens || mensagens.length === 0) return;

    const msg = mensagens[mensagens.length - 1];
    document.getElementById('autor-nome').value = msg.autor || '';
    document.getElementById('autor-data').value = msg.data || new Date().toISOString().split('T')[0];
    document.getElementById('autor-texto').value = msg.texto || '';
}

async function publicarNovaAutor() {
    const autor = document.getElementById('autor-nome').value.trim();
    const texto = document.getElementById('autor-texto').value.trim();
    const data = new Date().toISOString().split('T')[0];

    if (!autor || !texto) {
        alert("Preencha o nome do autor e o texto da mensagem!");
        return;
    }

    const dados = {
        acao: 'salvar_mensagem_autor',
        autor: autor,
        data: data,
        texto: texto
    };

    const res = await apiRequisicao('mensagens_autor', 'POST', dados);
    if (res && res.sucesso) {
        alert("Mensagem do autor publicada com sucesso!");
        carregarMensagemAutor();
    } else {
        alert("Erro ao publicar mensagem.");
    }
}

async function excluirMensagemAutor() {
    if (confirm("Deseja excluir a mensagem do autor?")) {
        const mensagens = await buscarTabela('mensagens_autor');
        if (mensagens && mensagens.length > 0) {
            const ultimoId = mensagens[mensagens.length - 1].id;
            const dados = { acao: 'excluir_registro', tabela: 'mensagens_autor', id: ultimoId };
            const res = await apiRequisicao('mensagens_autor', 'POST', dados);
            if (res && res.sucesso) {
                document.getElementById('autor-nome').value = '';
                document.getElementById('autor-texto').value = '';
                alert("Mensagem excluída!");
            }
        }
    }
}

// ==========================================
// 7. PEDIDOS DE AJUDA (AMPARO)
// ==========================================
async function carregarRelatos() {
    const relatos = await buscarTabela('relatos_ajuda');
    const container = document.getElementById('lista-relatos');
    if (!container) return;

    container.innerHTML = '';
    if (!relatos || relatos.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-500 italic">Nenhum pedido de ajuda registrado.</p>';
        return;
    }

    relatos.forEach(r => {
        const div = document.createElement('div');
        div.className = "bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2";
        div.innerHTML = `
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>De: <strong>${r.autor || 'Anônimo'}</strong></span>
                <span>${r.data_hora || r.data_iso || ''}</span>
            </div>
            <p class="text-sm text-gray-800">${r.texto}</p>
            ${r.resposta ? `<div class="bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-xs text-blue-900 mt-2"><strong>Resposta dada:</strong> ${r.resposta}</div>` : ''}
            <div class="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button onclick="abrirModalResposta(${r.id}, '${encodeURIComponent(r.texto)}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm">
                    <i data-lucide="reply" class="w-3.5 h-3.5"></i> Responder
                </button>
                <button onclick="excluirRelato(${r.id})" class="text-red-600 hover:text-red-700 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition cursor-pointer">
                    Excluir
                </button>
            </div>
        `;
        container.appendChild(div);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function abrirModalResposta(id, textoEncoded) {
    relatoIdAtual = id;
    document.getElementById('modal-texto-viajante').textContent = decodeURIComponent(textoEncoded);
    document.getElementById('modal-nome-adm').textContent = adminLogado ? adminLogado.apelido : 'Admin';
    document.getElementById('modal-input-resposta').value = '';
    document.getElementById('modal-resposta').classList.remove('hidden');
    document.getElementById('modal-resposta').classList.add('flex');
}

function fecharModalResposta() {
    document.getElementById('modal-resposta').classList.remove('flex');
    document.getElementById('modal-resposta').classList.add('hidden');
}

async function salvarRespostaModal() {
    const respostaTexto = document.getElementById('modal-input-resposta').value.trim();
    if (!respostaTexto) {
        alert("Escreva uma resposta!");
        return;
    }

    const dados = {
        acao: 'responder_relato',
        id: relatoIdAtual,
        resposta: respostaTexto
    };

    const res = await apiRequisicao('relatos_ajuda', 'POST', dados);
    if (res && res.sucesso) {
        fecharModalResposta();
        carregarRelatos();
    } else {
        alert("Erro ao enviar resposta.");
    }
}

async function excluirRelato(id) {
    if (confirm("Excluir este pedido de ajuda?")) {
        const dados = { acao: 'excluir_registro', tabela: 'relatos_ajuda', id: id };
        const res = await apiRequisicao('relatos_ajuda', 'POST', dados);
        if (res && res.sucesso) carregarRelatos();
    }
}

// ==========================================
// 8. CONFIGURAÇÕES E PERFIL
// ==========================================
async function salvarMeuPerfil() {
    alert("Função de perfil atualizada com sucesso!");
}

async function cadastrarNovoAdministrador() {
    const apelido = document.getElementById('novo-adm-apelido').value.trim();
    const id = document.getElementById('novo-adm-id').value.trim();
    const senha = document.getElementById('novo-adm-senha').value.trim();

    if (!apelido || !id || !senha) {
        alert("Preencha todos os campos do novo administrador!");
        return;
    }

    // Como o backend aceita inserção via POST caso crie a rota, vamos enviar um aviso ou implementar
    alert("Funcionalidade de cadastro de novos administradores pronta para integração.");
}

async function carregarAdminsCadastrados() {
    const admins = await buscarTabela('admins');
    const container = document.getElementById('lista-admins-cadastrados');
    if (!container) return;

    container.innerHTML = '';
    if (!admins) return;

    admins.forEach(a => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs";
        div.innerHTML = `
            <span><strong>${a.apelido}</strong> (ID: ${a.id})</span>
            <span class="text-gray-400">Nível: ${a.nivel || 'Admin'}</span>
        `;
        container.appendChild(div);
    });
}
async function cadastrarNovoAdministrador() {
    const apelido = document.getElementById('novo-adm-apelido').value.trim();
    const id = document.getElementById('novo-adm-id').value.trim();
    const senha = document.getElementById('novo-adm-senha').value.trim();

    if (!apelido || !id || !senha) {
        alert("Preencha todos os campos do novo administrador!");
        return;
    }

    const dados = {
        acao: 'cadastrar_admin',
        id: id,
        apelido: apelido,
        senha: senha,
        nivel: 'Admin'
    };

    const res = await apiRequisicao('admins', 'POST', dados);
    if (res && res.sucesso) {
        alert("Administrador cadastrado com sucesso!");
        document.getElementById('novo-adm-apelido').value = '';
        document.getElementById('novo-adm-id').value = '';
        document.getElementById('novo-adm-senha').value = '';
        carregarAdminsCadastrados();
    } else {
        alert(res?.erro || "Erro ao cadastrar administrador.");
    }
}
