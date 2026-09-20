// URL da API PHP que conecta ao seu banco MySQL (ajuste conforme o seu servidor)
const API_URL = "https://equalizese.vercel.app/dados.php"; 

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
        salvarPendenciaReacao(dataIso, indexMensagem, reacaoAnteriorNoCard, 'remover');
    }

    localStorage.setItem(chaveLocalMarcada, tipoReacao);
    localStorage.setItem(chaveLocalTipo, "true");

    if (contadorSpan) {
        contadorSpan.innerText = valorAtualContador + 1;
    }
    elementoBotao.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50');

    salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, 'adicionar');
}

// Gerencia reações pendentes no localStorage para sincronizar com o MySQL
function salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, acao) {
    let pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
    pendencias = pendencias.filter(p => !(p.dataIso === dataIso && p.indexMensagem === indexMensagem && p.tipoReacao === tipoReacao));
    pendencias.push({ dataIso, indexMensagem, tipoReacao, acao });
    localStorage.setItem('equalize_pendencias_reacoes', JSON.stringify(pendencias));
}

// Sincroniza as reações pendentes com o servidor MySQL via API
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

// Função que busca os dados do servidor MySQL e renderiza na tela
async function carregarDadosDinamicos() {
    await sincronizarReacoesPendentes();

    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) return;

        const dadosGlobais = await resposta.json();

        // 1. Carrega Vídeo do Dia
        if (dadosGlobais.videoDoDia) {
            setTextoSeExistir("video-titulo", dadosGlobais.videoDoDia.titulo);
            setTextoSeExistir("video-descricao", dadosGlobais.videoDoDia.descricao);
            const iframeVideo = document.getElementById("video-iframe");
            if (iframeVideo && dadosGlobais.videoDoDia.youtubeId) {
                const novoSrc = 'https://www.youtube.com/embed/' + dadosGlobais.videoDoDia.youtubeId;
                if (!iframeVideo.src.includes(dadosGlobais.videoDoDia.youtubeId)) {
                    iframeVideo.src = novoSrc;
                }
            }
        }

        // 2. Carrega Mensagens do Dia / Mural
        const containerSecao = document.getElementById("secao-frases-container");
        const listaContainer = document.getElementById("lista-frases-do-dia");
        
        if (dadosGlobais.mensagensDoDia && dadosGlobais.mensagensDoDia.length > 0) {
            if (containerSecao) containerSecao.classList.remove("hidden");
            if (listaContainer) {
                listaContainer.innerHTML = "";

                dadosGlobais.mensagensDoDia.forEach((msg, indexReal) => {
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
        console.error("Erro ao carregar dados dinâmicos do MySQL:", e);
    }
}

async function carregarMensagemAutor() {
    try {
        const resposta = await fetch(API_URL);
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

function calcularSignoSolar(data) {
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    let signo = "Peixes", significado = "Foco em sensibilidade, intuição e conclusão de ciclos sutis.";
    if ((mes == 3 && dia >= 21) || (mes == 4 && dia <= 19)) { signo = "Áries"; significado = "Energia de coragem, impulso, liderança e iniciativa renovada."; }
    else if ((mes == 4 && dia >= 20) || (mes == 5 && dia <= 20)) { signo = "Touro"; significado = "Constância, valorização dos sentidos, foco prático e solidez."; }
    else if ((mes == 5 && dia >= 21) || (mes == 6 && dia <= 20)) { signo = "Gêmeos"; significado = "Curiosidade intelectual, versatilidade, trocas e comunicação fluida."; }
    else if ((mes == 6 && dia >= 21) || (mes == 7 && dia <= 22)) { signo = "Câncer"; significado = "Acolhimento emocional, conexão com as raízes, intuição e proteção."; }
    else if ((mes == 7 && dia >= 23) || (mes == 8 && dia <= 22)) { signo = "Leão"; significado = "Brilho pessoal, expressão criativa, autoconfiança e generosidade."; }
    else if ((mes == 8 && dia >= 23) || (mes == 9 && dia <= 22)) { signo = "Virgem"; significado = "Organização mental, foco nos detalhes, aprimoramento e utilidade.";}
    else if ((mes == 9 && dia >= 23) || (mes == 10 && dia <= 22)) { signo = "Libra"; significado = "Busca por equilíbrio, diplomacia, estética e harmonia nas relações."; }
    else if ((mes == 10 && dia >= 23) || (mes == 11 && dia <= 21)) { signo = "Escorpião"; significado = "Profundidade emocional, transformação, intensidade e clareza oculta."; }
    else if ((mes == 11 && dia >= 22) || (mes == 12 && dia <= 21)) { signo = "Sagitário"; significado = "Expansão, otimismo, busca por novos horizontes e aprendizados."; }
    else if ((mes == 12 && dia >= 22) || (mes == 1 && dia <= 19)) { signo = "Capricórnio"; significado = "Responsabilidade, foco em metas de longo prazo, disciplina e estrutura."; }
    else if ((mes == 1 && dia >= 20) || (mes == 2 && dia <= 18)) { signo = "Aquário"; significado = "Inovação, visão de futuro, originalidade e coletividade."; }
    setTextoSeExistir("astro-valor", "Sol em " + signo);
    setTextoSeExistir("astro-significado", significado);
}

function calcularFaseLua(data) {
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    let m = mes, a = ano;
    if (m < 3) { a--; m += 12; }
    m++;
    let c = 365.25 * a, e = 30.6 * m;
    let jd = c + e + dia - 694039.09;
    jd /= 29.53058867;
    let b_val = parseInt(jd);
    jd -= b_val;
    let idadeDias = jd * 29.53;
    let fase = "Lua Crescente", significado = "Fase voltada ao desenvolvimento, plantio de ideias e crescimento.";
    if (idadeDias < 1.84) { fase = "Lua Nova"; significado = "Momento excelente para intenções, recomeços e plantio de sementes."; }
    else if (idadeDias < 9.22) { fase = "Lua Crescente"; significado = "Impulso para dar andamento a projetos e fortalecer alicerces."; }
    else if (idadeDias < 18.45) { fase = "Lua Cheia"; significado = "Apogeu energético, intuição expandida, clareza e forte iluminação emocional."; }
    else if (idadeDias < 27.68) { fase = "Lua Minguante"; significado = "Período ideal para limpezas, encerramentos e desapegos."; }
    setTextoSeExistir("lua-valor", fase);
    setTextoSeExistir("lua-significado", significado);
}

document.addEventListener("DOMContentLoaded", async () => {
    const hoje = new Date();
    
    const opcoesData = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const elData = document.getElementById("data-hoje");
    if (elData) {
        elData.innerText = "Data de referência: " + hoje.toLocaleDateString('pt-BR', opcoesData);
    }

    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();
    
    const somaNumeros = ("" + dia + mes + ano).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    
    const reduzirUnidade = (n) => {
        while (n > 9) {
            n = String(n).split('').reduce((a, c) => a + parseInt(c), 0);
        }
        return n;
    };

    const numeroDia = reduzirUnidade(somaNumeros);
    
    const significadosNumerologia = {
        1: "Dia de novos começos, iniciativa e liderança pessoal.",
        2: "Momento de cooperação, diplomacia, paciência e parcerias.",
        3: "Foco na comunicação, expressão criativa, alegria e expansão.",
        4: "Construção sólida, organização, foco no trabalho e estabilidade.",
        5: "Energia de mudanças, versatilidade, liberdade e novas experiências.",
        6: "Harmonia familiar, cuidado com o lar, responsabilidade e afeto.",
        7: "Intuição acentuada, estudo, introspecção e busca espiritual.",
        8: "Poder pessoal, foco em realizações materiais, justiça e finanças.",
        9: "Conclusão de ciclos, generosidade, compaixão e desapego."
    };

    setTextoSeExistir("num-valor", "Vibração " + numeroDia);
    setTextoSeExistir("num-significado", significadosNumerologia[numeroDia] || "Dia de energias equilibradas.");

    calcularFaseLua(hoje);
    calcularSignoSolar(hoje);

    await carregarMensagemAutor();
    await carregarDadosDinamicos();

    // Atualiza os dados periodicamente a cada 5 segundos
    setInterval(carregarDadosDinamicos, 5000);
});