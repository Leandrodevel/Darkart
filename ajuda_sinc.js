// ==========================================
// MÓDULO: ajuda_sinc.js (Versão Supabase Corrigida)
// Sincronização de Pedidos de Ajuda com o Banco de Dados
// ==========================================

const SUPABASE_URL = 'https://pgotayoloyhyufgicvhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3RheW9sb3loeXVmZ2ljdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg1ODAsImV4cCI6MjEwNTQ4NDU4MH0.yrW90hK_8QaR3Y4wAz-M6k9Lw2x7zXiQo0n6TQsHB94';

// Inicializa o cliente do Supabase
const supabaseAjudaClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Função para buscar e agrupar os relatos por data para compatibilidade com o HTML
async function buscarDadosAjudaServidor() {
    try {
        if (!supabaseAjudaClient) throw new Error("Cliente Supabase não inicializado.");

        const { data, error } = await supabaseAjudaClient
            .from('relatos_ajuda')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        // Reconstrói o formato de objeto agrupado por data_iso que o ajuda.html lê
        const dadosAgrupados = {};
        
        if (data) {
            data.forEach(item => {
                const dataIso = item.data_iso || new Date().toISOString().split('T')[0];
                
                if (!dadosAgrupados[dataIso]) {
                    dadosAgrupados[dataIso] = { relatosAjuda: [] };
                }

                dadosAgrupados[dataIso].relatosAjuda.push({
                    id: item.id,
                    autor: item.autor,
                    texto: item.texto,
                    resposta: item.resposta,
                    dataHora: item.data_hora
                });
            });
        }

        return dadosAgrupados;
    } catch (error) {
        console.error("Erro ao buscar dados de ajuda:", error);
        return {};
    }
}

// Função para enviar um novo pedido de ajuda / relato para o banco Supabase
async function enviarPedidoAjuda(autor, textoRelato) {
    if (!textoRelato || textoRelato.trim() === "") {
        alert("O texto do relato não pode estar vazio.");
        return false;
    }

    try {
        if (!supabaseAjudaClient) throw new Error("Cliente Supabase não inicializado.");

        const agora = new Date();
        const dataIsoFormatada = agora.toISOString().split('T')[0];
        const dataHoraFormatada = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const novoRelato = {
            data_iso: dataIsoFormatada,
            autor: autor && autor.trim() !== "" ? autor.trim() : "Anônimo",
            texto: textoRelato.trim(),
            resposta: null,
            data_hora: dataHoraFormatada,
            timestamp: agora.getTime()
        };

        const { error } = await supabaseAjudaClient
            .from('relatos_ajuda')
            .insert([novoRelato]);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error("Erro ao enviar pedido de ajuda:", error);
        alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
        return false;
    }
}