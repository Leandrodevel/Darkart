// Configuração do JSONBin.io para o Equalize-se
const BIN_ID = "6aad2526ffd5d1605315b555";
const API_KEY = "$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq";

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Função auxiliar para obter a chave de data no formato YYYY-MM-DD
function obterChaveDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Função para buscar os dados do dia atual do servidor
async function buscarDadosDoBanco() {
    try {
        const resposta = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY // Opcional, mas garante compatibilidade
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao conectar com o servidor: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        const mensagemDoAutor = await resultado.record.mensagensDoAutor;
       //console.log(mensagemDoAutor.texto); // Exibe a mensagem do autor em um alerta
        const dadosGlobais = resultado.record || {};
        const chaveHoje = obterChaveDataHoje();

        // Retorna os dados específicos do dia de hoje, se existirem
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