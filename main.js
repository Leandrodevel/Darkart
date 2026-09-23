// ==========================================
// CONFIGURAÇÃO DO SUPABASE - MAIN.JS
// ==========================================
const SUPABASE_URL = 'https://pgotayoloyhyufgicvhd.supabase.co';
    
const SUPABASE_ANON_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3RheW9sb3loeXVmZ2ljdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg1ODAsImV4cCI6MjEwNTQ4NDU4MH0.yrW90hK_8QaR3Y4wAz-M6k9Lw2x7zXiQo0n6TQsHB94';

// Inicializa o cliente do Supabase
const supabaseMainClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

lucide.createIcons();

// Tempo de bloqueio em milissegundos (1 hora = 60 * 60 * 1000 = 3600000 ms)
const TEMPO_BLOQUEIO_MS = 60 * 60 * 1000; 

function abrirModalFrase() {
    const ultimoEnvioTimestamp = parseInt(localStorage.getItem('equalize_ultimo_envio_ts') || '0');
    const agora = Date.now();
    const tempoDecorrido = agora - ultimoEnvioTimestamp;

    if (tempoDecorrido < TEMPO_BLOQUEIO_MS) {
        const tempoRestanteMs = TEMPO_BLOQUEIO_MS - tempoDecorrido;
        const minutosRestantes = Math.ceil(tempoRestanteMs / (60 * 1000));
        alert(`Você precisa aguardar mais ${minutosRestantes} minuto(s) para enviar uma nova mensagem.`);
        return;
    }

    document.getElementById("modal-frase").classList.remove("hidden");
}

// Função para atualizar o visual do botão de envio caso esteja no tempo de espera
function atualizarEstadoBotaoEnvio() {
    const botao = document.getElementById("btn-abrir-modal-frase");
    if (!botao) return;

    const ultimoEnvioTimestamp = parseInt(localStorage.getItem('equalize_ultimo_envio_ts') || '0');
    const agora = Date.now();
    const tempoDecorrido = agora - ultimoEnvioTimestamp;

    if (tempoDecorrido < TEMPO_BLOQUEIO_MS) {
        const tempoRestanteMs = TEMPO_BLOQUEIO_MS - tempoDecorrido;
        const minutos = Math.floor(tempoRestanteMs / (60 * 1000));
        const segundos = Math.floor((tempoRestanteMs % (60 * 1000)) / 1000);

        // Estilo Cinza e Inativo
        botao.className = "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-6 py-4 rounded-full shadow-none cursor-not-allowed flex items-center gap-2 border-2 border-slate-200 font-medium transition-all";
        
        const spanTexto = botao.querySelector("span");
        if (spanTexto) {
            spanTexto.innerText = `Aguarde ${minutos}m ${segundos}s`;
        }
    } else {
        // Estilo Normal Ativo (Verde)
        botao.className = "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 border-2 border-white/40 font-medium cursor-pointer";
        
        const spanTexto = botao.querySelector("span");
        if (spanTexto) {
            spanTexto.innerText = "Deixe sua mensagem";
        }
    }
}
function fecharModalFrase() {
    document.getElementById("modal-frase").classList.add("hidden");
    document.getElementById("input-mensagem-usuario").value = "";
}
function mostrarAvisoFlutuante(mensagem) {
    // Remove um aviso anterior se já existir para não acumular
    const avisoAntigo = document.getElementById('aviso-flutuante-toast');
    if (avisoAntigo) {
        avisoAntigo.remove();
    }

    // Cria o elemento do span/modal flutuante
    const toast = document.createElement('div');
    toast.id = 'aviso-flutuante-toast';
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-lg transition-all duration-300 opacity-0 scale-95';
    toast.innerText = mensagem;

    // Adiciona ao corpo da página
    document.body.appendChild(toast);

    // Força o navegador a recalcular o estilo para disparar a animação de entrada (Fade In)
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'scale-95');
        toast.classList.add('opacity-100', 'scale-100');
    }, 10);

    // Remove o elemento automaticamente após 2,5 segundos com animação de saída
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'scale-100');
        toast.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            toast.remove();
        }, 300); // Tempo correspondente à transição
    }, 2500);
}

async function reagirMensagem(dataIso, indexMensagem, idMensagem, elementoBotao) {
    // Utiliza o ID único da mensagem do Supabase para evitar conflitos de índice
    const chaveLocalMarcada = 'reacao_ativa_coracao_id_' + idMensagem;
    const jaReagiu = localStorage.getItem(chaveLocalMarcada) === 'true';
    
    if (jaReagiu) {
        mostrarAvisoFlutuante("Você já curtiu esta mensagem!");
        return;
    }

    const containerBotoes = elementoBotao.closest('.flex-wrap');
    if (containerBotoes && containerBotoes.hasAttribute('data-bloqueado')) {
        return;
    }

    if (containerBotoes) containerBotoes.setAttribute('data-bloqueado', 'true');
    elementoBotao.classList.add('opacity-50', 'cursor-not-allowed');
    elementoBotao.style.pointerEvents = 'none';

    const contadorSpan = elementoBotao.querySelector('.contador-reacao');
    let valorAtualContador = parseInt(contadorSpan ? contadorSpan.innerText : '0') || 0;

    // Marca como curtido localmente usando o ID
    localStorage.setItem(chaveLocalMarcada, 'true');

    if (contadorSpan) {
        contadorSpan.innerText = valorAtualContador + 1;
    }
    
    // Aplica o estilo visual de curtido
    elementoBotao.classList.add('ring-2', 'ring-rose-400', 'bg-rose-50');
    const iconeCoracao = elementoBotao.querySelector('[data-lucide="heart"]');
    if (iconeCoracao) {
        iconeCoracao.classList.add('fill-rose-500', 'text-rose-500');
    }

    // Salva a pendência utilizando o ID da mensagem
    salvarPendenciaReacaoPorId(idMensagem, 'adicionar');
    await sincronizarReacoesPendentesPorId();
}

function salvarPendenciaReacaoPorId(idMensagem, acao) {
    let pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes_id') || '[]');
    pendencias = pendencias.filter(p => p.idMensagem !== idMensagem);
    pendencias.push({ idMensagem, acao });
    localStorage.setItem('equalize_pendencias_reacoes_id', JSON.stringify(pendencias));
}

async function sincronizarReacoesPendentesPorId() {
    const pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes_id') || '[]');
    if (pendencias.length === 0 || !supabaseMainClient) return;

    try {
        for (const p of pendencias) {
            const { data: msg, error: errBusca } = await supabaseMainClient
                .from('mensagens_dia')
                .select('*')
                .eq('id', p.idMensagem)
                .maybeSingle();

            if (errBusca || !msg) continue;
            
            let valorAtual = msg['reacao_coracao'] || 0;
            valorAtual += 1;

            await supabaseMainClient
                .from('mensagens_dia')
                .update({ 'reacao_coracao': valorAtual })
                .eq('id', p.idMensagem);
        }

        localStorage.removeItem('equalize_pendencias_reacoes_id');
    } catch (erro) {
        console.error("Erro ao sincronizar reações pendentes com o Supabase:", erro);
    }
}

async function enviarMensagemServidor() {
    const inputEl = document.getElementById("input-mensagem-usuario");
    const texto = inputEl.value.trim();
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
        await sincronizarReacoesPendentesPorId();

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

        // Salva o timestamp atual para bloquear novos envios por 1 hora
        localStorage.setItem('equalize_ultimo_envio_ts', Date.now().toString());

        inputEl.value = "";
        mostrarAvisoFlutuante("Mensagem enviada com sucesso!");
        fecharModalFrase();
        
        // Em vez de recarregar a página inteira, atualiza apenas os dados do chat dinamicamente
        await carregarDadosDinamicos();

    } catch (error) {
        console.error("Erro no envio:", error);
        alert("Houve um erro ao enviar a mensagem para o servidor. Tente novamente.");
    } finally {
        if (btn) {
            btn.innerText = "Enviar";
            btn.disabled = false;
        }
        atualizarEstadoBotaoEnvio();
    }
}

// ==========================================
// ==========================================
// CARREGAR MATÉRIAS DO SUPABASE (APENAS A ÚLTIMA PRÉVIA)
// ==========================================
async function carregarNoticias() {
    if (!supabaseMainClient) return;

    try {
        // Busca apenas a última matéria cadastrada no banco de dados
        const { data: materiasData, error } = await supabaseMainClient
            .from('materias')
            .select('*')
            .order('id', { ascending: false })
            .limit(1); // Garante que traga apenas 1 registro

        const listaNoticiasContainer = document.getElementById("lista-noticias");
        if (!listaNoticiasContainer) return;

        if (!error && materiasData && materiasData.length > 0) {
            listaNoticiasContainer.innerHTML = "";
            const materia = materiasData[0];
            
    const dataFormatada = new Date(materia.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            // Trata os campos para evitar valores vazios
            const titulo = materia.titulo || 'Sem título';
            const conteudo = materia.conteudo || materia.descricao || 'Nenhum conteúdo disponível.';
            const dataMateria = dataFormatada || '';
            const imagemUrl = materia.imagem || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80';

            const cardMateria = document.createElement("section");
            cardMateria.className = "bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 my-6";
            
            cardMateria.innerHTML = `
             <!-- Cabeçalho da Matéria (Categoria e Data) -->
                <div class="flex flex-wrap items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
                    <div>
                        <span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200">Artigo</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-medium">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-700"></i>
                        <span>${dataMateria}</span>
                    </div>
                </div>

                <!-- Imagem de Capa da Matéria (Reduzida e Centralizada) -->
                <div class="overflow-hidden rounded-2xl border border-slate-100 p-2 bg-slate-50/50 text-center">
                    <a href="news/page_detalhes.html?id=${materia.id}" class="block">
                        <img src="${imagemUrl}" alt="${titulo}" class="w-full sm:w-[65%] max-h-52 sm:h-52 object-cover rounded-xl mx-auto shadow-xs">
                    </a>
                </div>

                <!-- Título da Matéria -->
                <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug hover:text-emerald-800 transition-colors">
                    <a href="news/page_detalhes.html?id=${materia.id}">${titulo}</a>
                </h2>

                <!-- Prévia do Conteúdo com Efeito de Esmaecimento (Fade Out) -->
                <div class="relative">
                    <div class="text-slate-600 text-sm sm:text-base leading-relaxed max-h-24 overflow-hidden relative">
                        <p>${conteudo}</p>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                </div>

                <!-- Botão Continuar Lendo -->
                <div class="pt-2">
                    <a href="news/page_detalhes.html?id=${materia.id}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-emerald-200/60 shadow-sm hover:scale-105">
                        <span>Continuar lendo</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 text-emerald-700"></i>
                    </a>
                </div>
            `;
            
            listaNoticiasContainer.appendChild(cardMateria);
            lucide.createIcons();
        } else {
            listaNoticiasContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Nenhuma matéria encontrada no momento.</p>';
        }
    } catch (e) {
        console.error("Erro ao carregar prévia da matéria do Supabase:", e);
    }
}


// Carrega os dados dinâmicos do Supabase
async function carregarDadosDinamicos() {
    await sincronizarReacoesPendentesPorId();
    if (!supabaseMainClient) return;

    try {
        const hojeChave = obterChaveDataHoje();

        // 1. Carrega Vídeo do Dia
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

  // 2. Carrega Mensagens do Did / Mural em formato de Lista (Chat)
        const { data: mensagensData, error: msgError } = await supabaseMainClient
            .from('mensagens_dia')
            .select('*')
            .eq('data_iso', hojeChave)
            .order('id', { ascending: true }); // Ordem cronológica para parecer um chat

        const containerSecao = document.getElementById("secao-frases-container");
        const listaContainer = document.getElementById("lista-frases-do-dia");
        const contadorMural = document.getElementById("contador-mural-msgs");
        
        // Limpa qualquer intervalo antigo de slide se houver
        if (window._bannerIntervalo) clearInterval(window._bannerIntervalo);

        if (!msgError && mensagensData && mensagensData.length > 0) {
            if (containerSecao) containerSecao.classList.remove("hidden");
            if (contadorMural) contadorMural.innerText = `${mensagensData.length} recado(s)`;
            
            if (listaContainer) {
                listaContainer.innerHTML = "";

                // Exibe as mensagens em formato de balões/cards de mural
// Exibe as mensagens em formato de balões/cards de mural
mensagensData.forEach((msg, indexReal) => {
    const reacoes = {
        coracao: msg.reacao_coracao || 0,
        amem: msg.reacao_amem || 0,
        flor: msg.reacao_flor || 0
    };
    
    // Declaração correta da variável para evitar o erro
    const jaCurtiu = localStorage.getItem('reacao_ativa_coracao_id_' + msg.id) === 'true';
    const estiloCurtido = jaCurtiu ? 'ring-2 ring-rose-400 bg-rose-50' : '';
    const estiloIcone = jaCurtiu ? 'fill-rose-500 text-rose-500' : 'fill-rose-500/20 text-rose-500';
    const ponteiroDesativado = jaCurtiu ? 'opacity-75' : '';

    const card = document.createElement("div");
    card.className = "bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all hover:border-emerald-300";
    
    card.innerHTML = 
     '<div class="flex items-start justify-between gap-2 mb-2">' +
        '<p class="text-sm text-slate-800 italic">"' + msg.texto + '"</p>' +
    '</div>' +
    '<div class="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">' +
        '<div class="flex items-center gap-1.5 flex-wrap">' +
            '<button data-tipo-reacao="coracao" onclick="reagirMensagem(\'' + msg.data_iso + '\', ' + indexReal + ', \'' + msg.id + '\', this)" class="flex items-center gap-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ' + estiloCurtido + ' ' + ponteiroDesativado + '">' +
                '<i data-lucide="heart" class="w-4 h-4 ' + estiloIcone + '"></i>' +
                '<span class="font-semibold text-slate-600 contador-reacao">' + reacoes.coracao + '</span>' +
            '</button>' +
        '</div>' +
        '<div class="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">' +
            '<i data-lucide="clock" class="w-3 h-3"></i>' +
            '<span>' + (msg.horario || '') + '</span>' +
        '</div>' +
    '</div>';
    
    listaContainer.appendChild(card);
});


                // Faz o chat rolar automaticamente para a mensagem mais recente (fundo da lista)
                listaContainer.scrollTop = listaContainer.scrollHeight;
            }
        } else {
            if (listaContainer) {
                listaContainer.innerHTML = 
                    '<div class="bg-white/90 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3">' +
                        '<div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">' +
                            '<i data-lucide="message-square-off" class="w-6 h-6"></i>' +
                        '</div>' +
                        '<div>' +
                            '<h3 class="text-sm font-bold text-slate-900">Nenhum recado ainda</h3>' +
                            '<p class="text-xs text-slate-500 mt-1">Seja o primeiro visitante a deixar uma mensagem de bom dia!</p>' +
                        '</div>' +
                    '</div>';
                if (contadorMural) contadorMural.innerText = "0 mensagens";
            }
        }

        // 3. Carrega as Matérias
        await carregarNoticias();

        lucide.createIcons();
    } catch (e) {
        console.error("Erro ao carregar dados dinâmicos do Supabase:", e);
    }
}

// Carrega a mensagem do autor do Supabase
async function carregarMensagemAutor() {
    if (!supabaseMainClient) return;

    try {
        const { data: autorData, error } = await supabaseMainClient
            .from('mensagens_autor')
            .select('*').maybeSingle();

        const elemento = document.getElementById("mensagem-do-autor");
        const melementoAutor = document.getElementById("mensagem-dia-autor");
        const elementoData = document.getElementById("mensagem-dia-data");
        
        if (elemento) {
            if (!error && autorData && autorData.texto) {
                elemento.innerHTML = autorData.texto;
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

    // Atualiza o estado do botão de hora em hora/segundo a segundo
    atualizarEstadoBotaoEnvio();
    setInterval(atualizarEstadoBotaoEnvio, 1000); // Roda a cada 1 segundo para atualizar o relógio

    // Atualiza os dados periodicamente a cada 5 segundos
    setInterval(carregarDadosDinamicos, 5000);
});
