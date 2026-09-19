// ==========================================
// MÓDULO UNIFICADO: adm_config.js (GitHub API)
// ==========================================

// Configurações do seu Repositório no GitHub
const GITHUB_USER = "Leandrodevel";       // Ex: "seu-nome-de-usuario"
const GITHUB_REPO = "Darkart";       // Ex: "meu-site-esoterico"
const GITHUB_PATH = "dados.json";                // O caminho do arquivo JSON no repositório
const GITHUB_TOKEN = "ghp_1E4KGum3cj74dcrPwSto0up9fekwQXoWJ9vJ"; // Cole o seu token gerado aqui
    // O token que você gerou no Passo 1

const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// ------------------------------------------
// FUNÇÃO CENTRAL: Ler o JSON completo do GitHub
// ------------------------------------------
async function lerArquivoGitHub() {
    try {
        const resposta = await fetch(GITHUB_API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
        });
        if (!resposta.ok) throw new Error(`Erro ao ler do GitHub: ${resposta.status}`);
        
        const dadosJson = await resposta.json();
        // O GitHub retorna o conteúdo em Base64, precisamos decodificar para texto/objeto
        const conteudoDecodificado = decodeURIComponent(escape(atob(dadosJson.content)));
        
        return {
            conteudoObjeto: JSON.parse(conteudoDecodificado),
            sha: dadosJson.sha // O SHA é obrigatório pelo GitHub para atualizar o arquivo depois
        };
    } catch (error) {
        console.error("Erro ao buscar dados do GitHub:", error);
        return null;
    }
}

// ------------------------------------------
// FUNÇÃO CENTRAL: Salvar/Atualizar o JSON no GitHub
// ------------------------------------------
async function salvarArquivoGitHub(novoObjeto, mensagemCommit = "Atualização de dados via painel") {
    try {
        // Primeiro precisamos pegar o SHA atual do arquivo
        const arquivoAtual = await lerArquivoGitHub();
        if (!arquivoAtual) throw new Error("Não foi possível obter o SHA atual do arquivo.");

        // Codifica o objeto JSON novamente para Base64
        const conteudoBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(novoObjeto, null, 2))));

        const resposta = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: mensagemCommit,
                content: conteudoBase64,
                sha: arquivoAtual.sha // Necessário para o GitHub aceitar a substituição
            })
        });

        if (!resposta.ok) throw new Error(`Erro ao salvar no GitHub: ${resposta.status}`);
        return true;
    } catch (error) {
        console.error("Erro ao salvar dados no GitHub:", error);
        return false;
    }
}

// ------------------------------------------
// MÓDULO 1: DADOS DE AJUDA E ADMS
// ------------------------------------------
async function buscarDadosAjudaServidor() {
    const dados = await lerArquivoGitHub();
    if (!dados) return null;
    
    // Retorna as chaves correspondentes aos dados de ajuda e adm que estavam no seu Bin antigo
    return {
        configAdm: dados.conteudoObjeto.configAdm || {},
        relatosAjuda: dados.conteudoObjeto.relatosAjuda || {}
    };
}

async function salvarDadosAjudaServidor(dadosAjudaGlobais) {
    const dados = await lerArquivoGitHub();
    if (!dados) return false;

    // Atualiza apenas as partes de ajuda e config dentro do objeto total
    dados.conteudoObjeto.configAdm = dadosAjudaGlobais.configAdm || dados.conteudoObjeto.configAdm;
    dados.conteudoObjeto.relatosAjuda = dadosAjudaGlobais.relatosAjuda || dados.conteudoObjeto.relatosAjuda;

    return await salvarArquivoGitHub(dados.conteudoObjeto, "Atualização de Dados de Ajuda/Admin");
}

// ------------------------------------------
// MÓDULO 2: DADOS PRINCIPAIS (Vídeos, Mensagens, etc)
// ------------------------------------------
async function buscarDadosDoBanco() {
    const dados = await lerArquivoGitHub();
    if (!dados) return null;

    const todosOsDados = dados.conteudoObjeto;
    const dataHoje = obterChaveDataHoje();

    return {
        dados: todosOsDados[dataHoje] || null,
        todosOsDados: todosOsDados,
        mensagemDoAutor: todosOsDados.mensagensDoAutor || null
    };
}

async function salvarDadosNoBanco(todosOsDados) {
    // Salva o objeto global completo que veio do painel
    return await salvarArquivoGitHub(todosOsDados, "Atualização de Dados Principais do Site");
}
