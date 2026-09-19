// ==========================================
// MÓDULO UNIFICADO: adm_config.js (GitHub API)
// ==========================================

// Configurações do seu Repositório no GitHub
const GITHUB_USER = "Leandrodevel";       // Ex: "seu-nome-de-usuario"
const GITHUB_REPO = "Darkart";       // Ex: "meu-site-esoterico"
const GITHUB_PATH = "dados.json";                // O caminho do arquivo JSON no repositório
const GITHUB_TOKEN = ""; // Cole o seu token gerado aqui
    // O token que você gerou no Passo 1



const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

https://api.github.com/repos/Leandrodevel/Darkart/contents/dados.json

function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}



// ------------------------------------------
// FUNÇÃO CENTRAL: Ler o JSON completo do GitHub


/*------------------

fetch(`https://api.github.com/repos/Leandrodevel/Darkart/contents/dados.json`, {
    headers: {
        'Authorization': 'token ' + "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",
        'Accept': 'application/vnd.github.v3+json'
    }
}).then(r => r.json()).then(console.log).catch(console.error);


-----------------------*/
async function lerArquivoGitHub() {
    try {
        const resposta = await fetch(GITHUB_API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Status ${resposta.status} - Resposta: ${erroTexto}`);
        }
        
        const dadosJson = await resposta.json();
        
        // Remove todas as quebras de linha e espaços que o GitHub coloca no Base64
        const base64Limpo = dadosJson.content.replace(/[\r\n\s]/g, '');
        
        // Decodifica o Base64 para texto de forma segura e compatível com UTF-8
        const binarioString = atob(base64Limpo);
        const bytes = Uint8Array.from(binarioString, (m) => m.codePointAt(0));
        const conteudoDecodificado = new TextDecoder().decode(bytes);
        
        return {
            conteudoObjeto: JSON.parse(conteudoDecodificado),
            sha: dadosJson.sha
        };
    } catch (error) {
        console.error("Erro detalhado ao ler do GitHub:", error);
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
    if (!dados){
        return null};

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
