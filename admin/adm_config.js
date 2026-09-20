// ==========================================
// CONFIGURAÇÃO DE CONEXÃO MYSQL (EQZ_DB) - ADM_CONFIG.JS
// ==========================================

const API_BASE_URL = "api/admin.php";

async function apiRequisicao(recurso, metodo = 'GET', dados = null, id = null) {
    let url = `${API_BASE_URL}?recurso=${recurso}`;
    if (id !== null) url += `&id=${id}`;

    const opcoes = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' }
    };

    if (dados && (metodo === 'POST' || metodo === 'PUT')) {
        opcoes.body = JSON.stringify(dados);
    }

    try {
        const resposta = await fetch(url, opcoes);
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
        return await resposta.json();
    } catch (erro) {
        console.error(`Erro na operação [${metodo}] para [${recurso}]:`, erro);
        return null;
    }
}

// Funções globais de acesso às tabelas do eqz_db
async function buscarTabela(nomeTabela) {
    return await apiRequisicao(nomeTabela, 'GET');
}

async function salvarRegistro(nomeTabela, dados) {
    const metodo = (dados.id || dados.data) ? 'PUT' : 'POST';
    return await apiRequisicao(nomeTabela, metodo, dados);
}

async function deletarRegistro(nomeTabela, id) {
    return await apiRequisicao(nomeTabela, 'DELETE', null, id);
}