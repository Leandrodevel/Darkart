// ==========================================
// MÓDULO UNIFICADO: adm_config.js
// Sincronização com o JSONBin.io (Principal e Ajuda)
// ==========================================

// --- CONFIGURAÇÕES DO BIN DE AJUDA ---
const AJUDA_BIN_ID = "6aad99c2ac6210605adda82f";
const AJUDA_API_KEY = "$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq";
const AJUDA_API_URL = `https://api.jsonbin.io/v3/b/${AJUDA_BIN_ID}`;

// --- CONFIGURAÇÕES DO BIN PRINCIPAL (Vídeos, Mensagens, Autor) ---
const BIN_ID = "6aad2526ffd5d1605315b555";
const API_KEY = "$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ==========================================
// FUNÇÕES AUXILIARES DE DATA
// ==========================================
function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function obterChaveDataHojeAjuda() {
    return obterChaveDataHoje();
}

// ==========================================
// MÓDULO 1: GERENCIAMENTO DE AJUDA
// ==========================================
async function buscarDadosAjudaServidor() {
    try {
        const resposta = await fetch(AJUDA_API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': AJUDA_API_KEY,
                'X-Access-Key': AJUDA_API_KEY
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao conectar com o servidor: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        return resultado.record || {};
    } catch (error) {
        console.error("Erro ao buscar dados de ajuda:", error);
        return null;
    }
}

async function salvarDadosAjudaServidor(dadosGlobais) {
    try {
        const respostaPut = await fetch(AJUDA_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': AJUDA_API_KEY,
                'X-Access-Key': AJUDA_API_KEY
            },
            body: JSON.stringify(dadosGlobais)
        });

        if (!respostaPut.ok) {
            throw new Error(`Erro ao salvar no servidor: ${respostaPut.status}`);
        }

        return true;
    } catch (error) {
        console.error("Erro ao salvar dados no servidor:", error);
        return false;
    }
}

async function enviarPedidoAjuda(autor, textoRelato) {
    if (!textoRelato || textoRelato.trim() === "") {
        alert("O texto do relato não pode estar vazio.");
        return false;
    }

    try {
        const dadosGlobais = await buscarDadosAjudaServidor();
        if (dadosGlobais === null) {
            throw new Error("Não foi possível carregar o banco de dados.");
        }

        const chaveHoje = obterChaveDataHojeAjuda();
        const agora = new Date();
        const dataHoraFormatada = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        if (!dadosGlobais[chaveHoje]) {
            dadosGlobais[chaveHoje] = {
                videoDoDia: { titulo: "", descricao: "", youtubeId: "dQw4w9WgXcQ" },
                resumoDiario: {},
                mensagensDoDia: [],
                relatosAjuda: []
            };
        }

        if (!Array.isArray(dadosGlobais[chaveHoje].relatosAjuda)) {
            dadosGlobais[chaveHoje].relatosAjuda = [];
        }

        const novoRelato = {
            autor: autor && autor.trim() !== "" ? autor.trim() : "Anônimo",
            texto: textoRelato.trim(),
            resposta: "",
            dataHora: dataHoraFormatada,
            timestamp: agora.getTime()
        };

        dadosGlobais[chaveHoje].relatosAjuda.push(novoRelato);

        const sucesso = await salvarDadosAjudaServidor(dadosGlobais);
        if (!sucesso) {
            throw new Error("Erro ao salvar no servidor.");
        }

        return true;
    } catch (error) {
        console.error("Erro ao enviar pedido de ajuda:", error);
        alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
        return false;
    }
}

// ==========================================
// MÓDULO 2: GERENCIAMENTO PRINCIPAL (Vídeos, Mensagens, Autor)
// ==========================================
async function buscarDadosDoBanco() {
    try {
        const resposta = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao conectar com o servidor: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        const mensagemDoAutor = await resultado.record.mensagensDoAutor;
        const dadosGlobais = resultado.record || {};
        const chaveHoje = obterChaveDataHoje();

        return {
            dados: dadosGlobais[chaveHoje] || null,
            todosOsDados: dadosGlobais,
            mensagemDoAutor: mensagemDoAutor
        };

    } catch (error) {
        console.error("Erro na busca dos dados do banco:", error);
        return null;
    }
}
