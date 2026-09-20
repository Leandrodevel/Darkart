// ==========================================
// MÓDULO: ajuda_sinc.js (Versão MySQL / PHP)
// Sincronização de Pedidos de Ajuda com o Banco de Dados
// ==========================================

// Altere para o caminho correto do seu endpoint PHP que gerencia a ajuda
const URL_API_AJUDA = "api/ajuda.php"; 

// Função para buscar todos os relatos de ajuda do servidor MySQL
async function buscarDadosAjudaServidor() {
    try {
        const resposta = await fetch(URL_API_AJUDA, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao conectar com o servidor: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        return resultado || {};
    } catch (error) {
        console.error("Erro ao buscar dados de ajuda:", error);
        return null;
    }
}

// Função para enviar um novo pedido de ajuda / relato para o banco
async function enviarPedidoAjuda(autor, textoRelato) {
    if (!textoRelato || textoRelato.trim() === "") {
        alert("O texto do relato não pode estar vazio.");
        return false;
    }

    try {
        const dadosEnvio = {
            acao: "enviar_relato",
            autor: autor && autor.trim() !== "" ? autor.trim() : "Anônimo",
            texto: textoRelato.trim()
        };

        const resposta = await fetch(URL_API_AJUDA, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosEnvio)
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao salvar no servidor: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        
        if (resultado.erro) {
            alert(resultado.erro);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Erro ao enviar pedido de ajuda:", error);
        alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
        return false;
    }
}