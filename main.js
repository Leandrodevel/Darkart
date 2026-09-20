// ==========================================
// CONFIGURAÇÃO DO SUPABASE - MAIN.JS
// ==========================================
const SUPABASE_URL = 'https://pgotayoloyhyufgicvhd.supabase.co';
    
const SUPABASE_ANON_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3RheW9sb3loeXVmZ2ljdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg1ODAsImV4cCI6MjEwNTQ4NDU4MH0.yrW90hK_8QaR3Y4wAz-M6k9Lw2x7zXiQo0n6TQsHB94';

// Inicializa o cliente do Supabase
const supabaseMainClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

lucide.createIcons();

function abrirModalFrase() {
    const hojeIso = obterChaveDataHoje();
    const ultimoEnvio = localStorage.getItem('equalize_ultimo_envio');
    
    if (ultimoEnvio === hojeIso) {
        alert("Você já enviou a sua mensagem permitida para hoje! Ela ficará ativa até amanhã.");
        return;
    }
    document.getElementById("modal-frase").classList.remove("hidden");
}

function fecharModalFrase() {
    document.getElementById("modal-frase").classList.add("hidden");
    document.getElementById("input-mensagem-usuario").value = "";
}

// Função Global para Reagir às Mensagens
async function reagirMensagem(dataIso, indexMensagem, idMensagem, tipoReacao, elementoBotao) {
    const containerBotoes = elementoBotao.closest('.flex-wrap');

    // Se já estiver bloqueado neste ciclo, apenas retorna
    if (containerBotoes.hasAttribute('data-bloqueado')) {
        return;
    }

    // Bloqueia temporariamente os botões deste card
    containerBotoes.setAttribute('data-bloqueado', 'true');
    containerBotoes.querySelectorAll('button').forEach(btn => {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.style.pointerEvents = 'none';
    });

    const chaveLocalTipo = 'reacao_tipo_' + dataIso + '_' + indexMensagem + '_' + tipoReacao;
    const chaveLocalMarcada = 'reacao_ativa_' + dataIso + '_' + indexMensagem;
    
    const reacaoAnteriorNoCard = localStorage.getItem(chaveLocalMarcada);
    const contadorSpan = elementoBotao.querySelector('.contador-reacao');
    let valorAtualContador = parseInt(contadorSpan ? contadorSpan.innerText : '0') || 0;

    if (reacaoAnteriorNoCard === tipoReacao) {
        localStorage.removeItem(chaveLocalMarcada);
        localStorage.removeItem(chaveLocalTipo);

        if (contadorSpan) {
            contadorSpan.innerText = Math.max(0, valorAtualContador - 1);
        }
        elementoBotao.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-50');

        salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, 'remover');
        // O bloqueio sairá sozinho daqui a pouco quando os 5 segundos passarem e a tela atualizar
        return;
    }

    if (reacaoAnteriorNoCard) {
        const botaoAnterior = containerBotoes.querySelector(`[data-tipo-reacao="${reacaoAnteriorNoCard}"]`);
        if (botaoAnterior) {
            const contadorAntigo = botaoAnterior.querySelector('.contador-reacao');
            if (contadorAntigo) {
                contadorAntigo.innerText = Math.max(0, (parseInt(contadorAntigo.innerText) || 1) - 1);
            }
            botaoAnterior.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-50');
        }
        localStorage.removeItem('reacao_tipo_' + dataIso + '_' + indexMensagem + '_' + reacaoAnteriorNoCard);
        salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, 'remover');
    }

    localStorage.setItem(chaveLocalMarcada, tipoReacao);
    localStorage.setItem(chaveLocalTipo, "true");

    if (contadorSpan) {
        contadorSpan.innerText = valorAtualContador + 1;
    }
    elementoBotao.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50');

    salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, 'adicionar');
    
    // Sincroniza imediatamente com o Supabase
    await sincronizarReacoesPendentes();
    
    // Nota: Não removemos o 'data-bloqueado' aqui manualmente porque 
    // a atualização automática de 5 segundos vai recriar o card limpo e desbloqueado.
}


// Gerencia reações pendentes no localStorage
function salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, acao) {
    let pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
    pendencias = pendencias.filter(p => !(p.dataIso === dataIso && p.indexMensagem === indexMensagem && p.tipoReacao === tipoReacao));
    pendencias.push({ dataIso, indexMensagem, tipoReacao, acao });
    localStorage.setItem('equalize_pendencias_reacoes', JSON.stringify(pendencias));
}

// Sincroniza reações pendentes diretamente com o Supabase
async function sincronizarReacoesPendentes() {
    const pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
    if (pendencias.length === 0 || !supabaseMainClient) return;

    try {
        for (const p of pendencias) {
            // Busca o registo correspondente à data no Supabase
            const { data: registros, error: errBusca } = await supabaseMainClient
                .from('mensagens_dia')
                .select('*')
                .eq('data_iso', p.dataIso);

            if (errBusca) continue;
            
            // Localiza a mensagem exata pelo índice do array armazenado
            if (registros && registros[p.indexMensagem]) {
                const msg = registros[p.indexMensagem];
                let campoReacao = 'reacao_coracao';
                if (p.tipoReacao === 'amem') campoReacao = 'reacao_amem';
                if (p.tipoReacao === 'flor') campoReacao = 'reacao_flor';

                let valorAtual = msg[campoReacao] || 0;
                if (p.acao === 'adicionar') valorAtual += 1;
                else valorAtual = Math.max(0, valorAtual - 1);

                await supabaseMainClient
                    .from('mensagens_dia')
                    .update({ [campoReacao]: valorAtual })
                    .eq('id', msg.id);
            }
        }

        localStorage.removeItem('equalize_pendencias_reacoes');
    } catch (erro) {
        console.error("Erro ao sincronizar reações pendentes com o Supabase:", erro);
    }
}

// Envia uma nova mensagem gerada pelo usuário diretamente para o Supabase
async function enviarMensagemServidor() {
    const texto = document.getElementById("input-mensagem-usuario").value.trim();
    if (!texto) {
        alert("Por favor, escreva uma mensagem antes de enviar.");
        return;
    }

    const btn = document.getElementById("btn-enviar-msg");
    if (btn) {
        btn.innerText = "Enviando...";
        btn.disabled = true;
    }

    const dataHojeIso = obterChaveDataHoje();
    const horarioAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
        await sincronizarReacoesPendentes();

        if (!supabaseMainClient) throw new Error("Cliente Supabase não inicializado.");

        const { error } = await supabaseMainClient
            .from('mensagens_dia')
            .insert([{
                data_iso: dataHojeIso,
                horario: horarioAtual,
                texto: texto,
                reacao_coracao: 0,
                reacao_amem: 0,
                reacao_flor: 0
            }]);

        if (error) throw error;

        localStorage.setItem('equalize_ultimo_envio', dataHojeIso);

        alert("Mensagem enviada e publicada com sucesso!");
        fecharModalFrase();
        window.location.reload();

    } catch (error) {
        console.error("Erro no envio:", error);
        alert("Houve um erro ao enviar a mensagem para o servidor. Tente novamente.");
        if (btn) {
            btn.innerText = "Enviar";
            btn.disabled = false;
        }
    }
}

// Carrega os dados dinâmicos (Vídeos e Mensagens do Dia) do Supabase
// Carrega os dados dinâmicos (Vídeos e Mensagens do Dia) do Supabase
async function carregarDadosDinamicos() {
    await sincronizarReacoesPendentes();
    if (!supabaseMainClient) return;

    try {
        const hojeChave = obterChaveDataHoje();

        // 1. Carrega Vídeo do Dia para a data de hoje
        const { data: videoData, error: videoError } = await supabaseMainClient
            .from('videos_dia')
            .select('*')
            .eq('data', hojeChave)
            .maybeSingle();

        if (!videoError && videoData) {
            setTextoSeExistir("video-titulo", videoData.titulo);
            setTextoSeExistir("video-descricao", videoData.descricao);
            const iframeVideo = document.getElementById("video-iframe");
            if (iframeVideo && videoData.youtube_id) {
                const novoSrc = 'https://www.youtube.com/embed/' + videoData.youtube_id;
                if (!iframeVideo.src.includes(videoData.youtube_id)) {
                    iframeVideo.src = novoSrc;
                }
            }
        }

        // 2. Carrega Mensagens do Dia / Mural para a data de hoje ordenadas da mais recente para a mais antiga
        const { data: mensagensData, error: msgError } = await supabaseMainClient
            .from('mensagens_dia')
            .select('*')
            .eq('data_iso', hojeChave)
            .order('id', { ascending: false }); // <-- ORDENAÇÃO CORRETA PELO BANCO (Mais recentes primeiro)

        const containerSecao = document.getElementById("secao-frases-container");
        const listaContainer = document.getElementById("lista-frases-do-dia");
        
        if (!msgError && mensagensData && mensagensData.length > 0) {
            if (containerSecao) containerSecao.classList.remove("hidden");
            if (listaContainer) {
                listaContainer.innerHTML = "";

                // Como os dados já vêm invertidos do banco, iteramos normalmente sem .reverse()
mensagensData.slice().reverse().forEach((msg, indexOriginal) => {
    const indexReal = mensagensData.length - 1 - indexOriginal;
    const reacoes = {
        coracao: msg.reacao_coracao || 0,
        amem: msg.reacao_amem || 0,
        flor: msg.reacao_flor || 0
    };
    
    const reacaoAtivaCoracao = localStorage.getItem('reacao_ativa_' + msg.data_iso + '_' + indexReal) === 'coracao' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';
    const reacaoAtivaAmem = localStorage.getItem('reacao_ativa_' + msg.data_iso + '_' + indexReal) === 'amem' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';
    const reacaoAtivaFlor = localStorage.getItem('reacao_ativa_' + msg.data_iso + '_' + indexReal) === 'flor' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';

    const card = document.createElement("div");
    card.className = "bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between";
    card.innerHTML = 
        '<p class="text-sm text-slate-800 italic mb-3">"' + msg.texto + '"</p>' +
        '<div class="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">' +
            '<div class="flex items-center gap-1.5 flex-wrap">' +
                '<button data-tipo-reacao="coracao" onclick="reagirMensagem(\'' + msg.data_iso + '\', ' + indexReal + ', \'' + msg.id + '\', \'coracao\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaCoracao + '">' +
                    '<span>❤️</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.coracao + '</span>' +
                '</button>' +
                '<button data-tipo-reacao="amem" onclick="reagirMensagem(\'' + msg.data_iso + '\', ' + indexReal + ', \'' + msg.id + '\', \'amem\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaAmem + '">' +
                    '<span>🙏</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.amem + '</span>' +
                '</button>' +
                '<button data-tipo-reacao="flor" onclick="reagirMensagem(\'' + msg.data_iso + '\', ' + indexReal + ', \'' + msg.id + '\', \'flor\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaFlor + '">' +
                    '<span>🌸</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.flor + '</span>' +
                '</button>' +
            '</div>' +
            '<div class="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">' +
                '<i data-lucide="clock" class="w-3 h-3"></i>' +
                '<span>' + (msg.horario || '') + '</span>' +
            '</div>' +
        '</div>';
    listaContainer.appendChild(card);
});

            }
        } else {
            if (listaContainer) {
                listaContainer.innerHTML = 
                    '<div class="bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3">' +
                        '<div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">' +
                            '<i data-lucide="message-square-off" class="w-6 h-6"></i>' +
                        '</div>' +
                        '<div>' +
                            '<h3 class="text-sm font-bold text-slate-900">Nenhuma mensagem por enquanto</h3>' +
                            '<p class="text-xs text-slate-500 mt-1">Ainda não há registros ou mensagens disponíveis para exibir neste momento.</p>' +
                        '</div>' +
                    '</div>';
            }
        }
        lucide.createIcons();
    } catch (e) {
        console.error("Erro ao carregar dados dinâmicos do Supabase:", e);
    }
}

// Carrega a mensagem do autor do Supabase
async function carregarMensagemAutor() {
    if (!supabaseMainClient) return;

    try {
        const hojeChave = obterChaveDataHoje();
        const { data: autorData, error } = await supabaseMainClient
            .from('mensagens_autor')
            .select('*')
            .eq('data', hojeChave)
            .maybeSingle();

        const elemento = document.getElementById("mensagem-do-autor");
        const melementoAutor = document.getElementById("mensagem-dia-autor");
        const elementoData = document.getElementById("mensagem-dia-data");
        
        if (elemento) {
            if (!error && autorData && autorData.texto) {
                elemento.innerText = autorData.texto;
                if (elementoData) elementoData.innerText = autorData.data || "Data não disponível.";
                if (melementoAutor) melementoAutor.innerText = autorData.autor || "Autor não disponível.";
            } else {
                elemento.innerText = "Mensagem do autor não disponível.";
            }
        }
    } catch (error) {
        console.error("Erro ao carregar mensagem do autor do Supabase:", error);
    }
}

function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function setTextoSeExistir(id, texto) {
    const el = document.getElementById(id);
    if (el) el.innerText = texto;
}

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof inicializarAstrologiaLua === 'function') {
        inicializarAstrologiaLua();
    }

    // Carrega os dados assíncronos do Supabase
    await carregarMensagemAutor();
    await carregarDadosDinamicos();

    // Atualiza os dados periodicamente a cada 5 segundos
    setInterval(carregarDadosDinamicos, 5000);
});