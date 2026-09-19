// ==========================================
// MÓDULO UNIFICADO: adm_config.js
// ==========================================

const AJUDA_BIN_ID = "6aad99c2ac6210605adda82f";
const AJUDA_API_KEY = "$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq";
const AJUDA_API_URL = `https://api.jsonbin.io/v3/b/${AJUDA_BIN_ID}`;

const BIN_ID = "6aad2526ffd5d1605315b555";
const API_KEY = "$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

async function buscarDadosAjudaServidor() {
    try {
        const resposta = await fetch(AJUDA_API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': AJUDA_API_KEY, 'X-Access-Key': AJUDA_API_KEY }
        });
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
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
        if (!respostaPut.ok) throw new Error(`Erro: ${respostaPut.status}`);
        return true;
    } catch (error) {
        console.error("Erro ao salvar dados no servidor:", error);
        return false;
    }
}

async function buscarDadosDoBanco() {
    try {
        const resposta = await fetch(API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY, 'X-Access-Key': API_KEY }
        });
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
        const resultado = await resposta.json();
        return {
            dados: resultado.record[obterChaveDataHoje()] || null,
            todosOsDados: resultado.record || {},
            mensagemDoAutor: resultado.record.mensagensDoAutor
        };
    } catch (error) {
        console.error("Erro no banco principal:", error);
        return null;
    }
}
