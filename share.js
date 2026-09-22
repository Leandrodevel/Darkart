async function compartilharPaginaAtual() {
    const dadosCompartilhamento = {
        title: document.title,
        text: "Confira esta página incrível!",
        url: window.location.href
    };

    // Tenta usar a API nativa de compartilhamento do dispositivo (celular/desktop compatível)
    if (navigator.share) {
        try {
            await navigator.share(dadosCompartilhamento);
        } catch (erro) {
            // Se o usuário cancelar o compartilhamento, não faz nada
            if (erro.name !== 'AbortError') {
                console.error("Erro ao compartilhar:", erro);
            }
        }
    } else {
        // Fallback: Se o navegador não suportar, copia o link para a área de transferência
        try {
            await navigator.clipboard.writeText(window.location.href);
            if (typeof mostrarAvisoFlutuante === 'function') {
                mostrarAvisoFlutuante("Link copiado para a área de transferência!");
            } else {
                alert("Link copiado!");
            }
        } catch (erro) {
            console.error("Erro ao copiar link:", erro);
        }
    }
}