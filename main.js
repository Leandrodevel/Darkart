// URL da API PHP rodando no XAMPP
const API_URL = "http://localhost/Darkart/api/dados.php"; 

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
async function reagirMensagem(dataIso, indexMensagem, tipoReacao, elementoBotao) {
    if (elementoBotao.closest('.flex-wrap').hasAttribute('data-bloqueado')) {
        return;
    }

    const containerBotoes = elementoBotao.closest('.flex-wrap');
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
}

// Gerencia reações pendentes no localStorage
function salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, acao) {
    let pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
    pendencias = pendencias.filter(p => !(p.dataIso === dataIso && p.indexMensagem === indexMensagem && p.tipoReacao === tipoReacao));
    pendencias.push({ dataIso, indexMensagem, tipoReacao, acao });
    localStorage.setItem('equalize_pendencias_reacoes', JSON.stringify(pendencias));
}

// Sincroniza reações pendentes com o servidor via PHP/MySQL
async function sincronizarReacoesPendentes() {
    const pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
    if (pendencias.length === 0) return;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'sincronizar_reacoes', pendencias })
        });

        if (resposta.ok) {
            localStorage.removeItem('equalize_pendencias_reacoes');
        }
    } catch (erro) {
        console.error("Erro ao sincronizar reações pendentes:", erro);
    }
}

// Envia uma nova mensagem gerada pelo usuário para o servidor
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

    try {
        await sincronizarReacoesPendentes();

        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                acao: 'enviar_mensagem',
                texto: texto,
                dataIso: dataHojeIso
            })
        });

        const resultado = await resposta.json();
        if (!resposta.ok || resultado.erro) {
            throw new Error(resultado.erro || "Erro ao salvar mensagem no servidor.");
        }

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

// Carrega os dados dinâmicos (Vídeos e Mensagens do Dia) do banco MySQL
async function carregarDadosDinamicos() {
    await sincronizarReacoesPendentes();

    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) return;

        const dadosGlobais = await resposta.json();
        const hojeChave = obterChaveDataHoje();
        const registroHoje = dadosGlobais[hojeChave];

        // 1. Carrega Vídeo do Dia
        if (registroHoje && registroHoje.videoDoDia) {
            setTextoSeExistir("video-titulo", registroHoje.videoDoDia.titulo);
            setTextoSeExistir("video-descricao", registroHoje.videoDoDia.descricao);
            const iframeVideo = document.getElementById("video-iframe");
            if (iframeVideo && registroHoje.videoDoDia.youtubeId) {
                const novoSrc = 'https://www.youtube.com/embed/' + registroHoje.videoDoDia.youtubeId;
                if (!iframeVideo.src.includes(registroHoje.videoDoDia.youtubeId)) {
                    iframeVideo.src = novoSrc;
                }
            }
        }

        // 2. Carrega Mensagens do Dia / Mural
        const containerSecao = document.getElementById("secao-frases-container");
        const listaContainer = document.getElementById("lista-frases-do-dia");
        
        if (registroHoje && registroHoje.mensagensDoDia && registroHoje.mensagensDoDia.length > 0) {
            if (containerSecao) containerSecao.classList.remove("hidden");
            if (listaContainer) {
                listaContainer.innerHTML = "";

                registroHoje.mensagensDoDia.slice().reverse().forEach((msg, indexOriginal) => {
                    const indexReal = registroHoje.mensagensDoDia.length - 1 - indexOriginal;
                    const reacoes = msg.reacoes || { coracao: 0, amem: 0, flor: 0 };
                    
                    const reacaoAtivaCoracao = localStorage.getItem('reacao_ativa_' + msg.dataIso + '_' + indexReal) === 'coracao' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';
                    const reacaoAtivaAmem = localStorage.getItem('reacao_ativa_' + msg.dataIso + '_' + indexReal) === 'amem' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';
                    const reacaoAtivaFlor = localStorage.getItem('reacao_ativa_' + msg.dataIso + '_' + indexReal) === 'flor' ? 'ring-2 ring-emerald-400 bg-emerald-50' : '';

                    const card = document.createElement("div");
                    card.className = "bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between";
                    card.innerHTML = 
                        '<p class="text-sm text-slate-800 italic mb-3">"' + msg.texto + '"</p>' +
                        '<div class="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">' +
                            '<div class="flex items-center gap-1.5 flex-wrap">' +
                                '<button data-msg-key="' + msg.dataIso + '-' + indexReal + '" data-tipo-reacao="coracao" onclick="reagirMensagem(\'' + msg.dataIso + '\', ' + indexReal + ', \'coracao\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaCoracao + '">' +
                                    '<span>❤️</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.coracao + '</span>' +
                                '</button>' +
                                '<button data-msg-key="' + msg.dataIso + '-' + indexReal + '" data-tipo-reacao="amem" onclick="reagirMensagem(\'' + msg.dataIso + '\', ' + indexReal + ', \'amem\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaAmem + '">' +
                                    '<span>🙏</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.amem + '</span>' +
                                '</button>' +
                                '<button data-msg-key="' + msg.dataIso + '-' + indexReal + '" data-tipo-reacao="flor" onclick="reagirMensagem(\'' + msg.dataIso + '\', ' + indexReal + ', \'flor\', this)" class="flex items-center gap-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ' + reacaoAtivaFlor + '">' +
                                    '<span>🌸</span> <span class="font-semibold text-slate-600 contador-reacao">' + reacoes.flor + '</span>' +
                                '</button>' +
                            '</div>' +
                            '<div class="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">' +
                                '<i data-lucide="clock" class="w-3 h-3"></i>' +
                                '<span>' + msg.horario + '</span>' +
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
        console.error("Erro ao carregar dados dinâmicos:", e);
    }
}

// Carrega a mensagem do autor do banco MySQL
async function carregarMensagemAutor() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) return;

        const dados = await resposta.json();
        const mensagemDoAutor = dados.mensagensDoAutor;

        const elemento = document.getElementById("mensagem-do-autor");
        const melementoAutor = document.getElementById("mensagem-dia-autor");
        const elementoData = document.getElementById("mensagem-dia-data");
        
        if (elemento) {
            if (mensagemDoAutor && mensagemDoAutor.texto) {
                elemento.innerText = mensagemDoAutor.texto;
                if (elementoData) elementoData.innerText = mensagemDoAutor.data || "Data não disponível.";
                if (melementoAutor) melementoAutor.innerText = mensagemDoAutor.autor || "Autor não disponível.";
            } else {
                elemento.innerText = "Mensagem do autor não disponível.";
            }
        }
    } catch (error) {
        console.error("Erro ao carregar mensagem do autor:", error);
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
    // Inicializa as funções de Astrologia, Lua e Numerologia que estão no novo arquivo
    // 1. Suas outras funções de carregamento (mensagens, dados, etc.)
  
    
    // 2. Adicione esta linha para disparar os cálculos de Astrologia, Lua e Numerologia
    if (typeof inicializarAstrologiaLua === 'function') {
        inicializarAstrologiaLua();
    }

    // Carrega os dados assíncronos do backend MySQL
    await carregarMensagemAutor();
    await carregarDadosDinamicos();

    // Atualiza os dados periodicamente a cada 5 segundos
    setInterval(carregarDadosDinamicos, 5000);
});
