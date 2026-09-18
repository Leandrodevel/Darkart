
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

    // Função Global para Reagir às Mensagens (Com bloqueio até o próximo recarregamento)
    async function reagirMensagem(dataIso, indexMensagem, tipoReacao, elementoBotao) {
        // Se a mensagem/card já foi marcado como bloqueado/processando nesta sessão antes do reload, ignora
        if (elementoBotao.closest('.flex-wrap').hasAttribute('data-bloqueado')) {
            return;
        }

        const containerBotoes = elementoBotao.closest('.flex-wrap');
        // Trava visualmente todos os botões de reação deste card imediatamente
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

        // Se o usuário clicar na MESMA reação que já tinha dado, cancela (Toggle)
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

        // Se já havia outra reação diferente na mesma mensagem, remove a anterior visualmente
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

        // Marca a nova reação
        localStorage.setItem(chaveLocalMarcada, tipoReacao);
        localStorage.setItem(chaveLocalTipo, "true");

        if (contadorSpan) {
            contadorSpan.innerText = valorAtualContador + 1;
        }
        elementoBotao.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50');

        salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, 'adicionar');
    }

    // Auxiliar para gerenciar a fila de reações pendentes
    function salvarPendenciaReacao(dataIso, indexMensagem, tipoReacao, acao) {
        let pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
        pendencias = pendencias.filter(p => !(p.dataIso === dataIso && p.indexMensagem === indexMensagem && p.tipoReacao === tipoReacao));
        pendencias.push({ dataIso, indexMensagem, tipoReacao, acao });
        localStorage.setItem('equalize_pendencias_reacoes', JSON.stringify(pendencias));
    }

    // Sincroniza as reações pendentes com o servidor JSONBin
    async function sincronizarReacoesPendentes() {
        const pendencias = JSON.parse(localStorage.getItem('equalize_pendencias_reacoes') || '[]');
        if (pendencias.length === 0) return;

        try {
            const getResp = await fetch(API_URL, {
                headers: { 'X-Master-Key': API_KEY }
            });
            if (!getResp.ok) return;
            
            const resJson = await getResp.json();
            const jsonAtual = resJson.record || {};
            let houveAlteracao = false;

            pendencias.forEach(p => {
                if (jsonAtual[p.dataIso] && jsonAtual[p.dataIso].mensagensDoDia && jsonAtual[p.dataIso].mensagensDoDia[p.indexMensagem]) {
                    const msg = jsonAtual[p.dataIso].mensagensDoDia[p.indexMensagem];
                    if (!msg.reacoes) {
                        msg.reacoes = { coracao: 0, amem: 0, flor: 0 };
                    }
                    if (msg.reacoes[p.tipoReacao] !== undefined) {
                        if (p.acao === 'adicionar') {
                            msg.reacoes[p.tipoReacao]++;
                        } else if (p.acao === 'remover') {
                            msg.reacoes[p.tipoReacao] = Math.max(0, msg.reacoes[p.tipoReacao] - 1);
                        }
                        houveAlteracao = true;
                    }
                }
            });

            if (houveAlteracao) {
                const putResp = await fetch(API_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': API_KEY
                    },
                    body: JSON.stringify(jsonAtual)
                });

                if (putResp.ok) {
                    localStorage.removeItem('equalize_pendencias_reacoes');
                }
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

        const agora = new Date();
        const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dataHojeIso = obterChaveDataHoje();

        const novaMensagemObj = {
            texto: texto,
            horario: horaFormatada,
            dataIso: dataHojeIso,
            reacoes: { coracao: 0, amem: 0, flor: 0 }
        };

        try {
            await sincronizarReacoesPendentes();

            const getResp = await fetch(API_URL, {
                headers: { 'X-Master-Key': API_KEY }
            });
            
            let jsonAtual = {};
            if (getResp.ok) {
                const resJson = await getResp.json();
                jsonAtual = resJson.record || {};
            }

            if (!jsonAtual[dataHojeIso]) {
                jsonAtual[dataHojeIso] = {
                    videoDoDia: { titulo: "", descricao: "", youtubeId: "dQw4w9WgXcQ" },
                    resumoDiario: {},
                    mensagensDoDia: []
                };
            }

            if (!jsonAtual[dataHojeIso].mensagensDoDia) {
                jsonAtual[dataHojeIso].mensagensDoDia = [];
            }

            jsonAtual[dataHojeIso].mensagensDoDia.push(novaMensagemObj);

            const putResp = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(jsonAtual)
            });

            if (!putResp.ok) throw new Error("Erro ao atualizar o servidor JSON.");

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
  
    // Função que busca os dados do servidor / API e renderiza os elementos
    async function carregarDadosDinamicos() {
        // Sincroniza reações pendentes antes de atualizar/recarregar a exibição
        await sincronizarReacoesPendentes();

        if (typeof buscarDadosDoBanco === 'function') {
            try {
                const resposta = await buscarDadosDoBanco();
                if (resposta && resposta.dados) {
                    const videoDoDia = resposta.dados.videoDoDia;
                    if (videoDoDia) {
                        setTextoSeExistir("video-titulo", videoDoDia.titulo);
                        setTextoSeExistir("video-descricao", videoDoDia.descricao);
                        const iframeVideo = document.getElementById("video-iframe");
                        if (iframeVideo && videoDoDia.youtubeId) {
                            const novoSrc = 'https://www.youtube.com/embed/' + videoDoDia.youtubeId;
                            if (!iframeVideo.src.includes(videoDoDia.youtubeId)) {
                                iframeVideo.src = novoSrc;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar dados do banco:", e);
            }
        }

        try {
            const hojeChave = obterChaveDataHoje();
            const getResp = await fetch(API_URL, { headers: { 'X-Master-Key': API_KEY } });
            if (getResp.ok) {
                const dadosGlobais = await getResp.json();
                const registroHoje = dadosGlobais.record[hojeChave];
                
                if (registroHoje && registroHoje.mensagensDoDia && registroHoje.mensagensDoDia.length > 0) {
                    const containerSecao = document.getElementById("secao-frases-container");
                    const listaContainer = document.getElementById("lista-frases-do-dia");
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

                        lucide.createIcons();
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao carregar mensagens dinâmicas:", e);
        }
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

        await carregarDadosDinamicos();

        // Atualiza os dados periodicamente a cada 5 segundos
        setInterval(carregarDadosDinamicos, 5000);
    });
    async function carregarMensagemAutor() {
    try {
        const resposta = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        const dados = await resposta.json();
        
        // Ajustado para 'mensagensDoAutor' (plural conforme o seu JSON)
        const mensagemDoAutor = dados.record.mensagensDoAutor;

        const elemento = document.getElementById("mensagem-do-autor");
        const melementoAutor = document.getElementById("mensagem-dia-autor");
        const elementoData = document.getElementById("mensagem-dia-data");
        if (elemento) {
            // Verifica se o objeto e a propriedade texto existem
            if (mensagemDoAutor && mensagemDoAutor.texto) {
                elemento.innerText = mensagemDoAutor.texto;
                elementoData.innerText = mensagemDoAutor.data || "Data não disponível.";
                melementoAutor.innerText = mensagemDoAutor.autor || "Autor não disponível.";
            } else {
                elemento.innerText = "Mensagem do autor não disponível.";
            }
        }
    } catch (error) {
        console.error("Erro ao carregar mensagem do autor:", error);
    }
}

carregarMensagemAutor();

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