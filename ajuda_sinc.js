// ==========================================
// MÓDULO: ajuda_sinc.js (Versão Supabase)
// Sincronização de Pedidos de Ajuda com o Banco de Dados
// ==========================================

// Configurações do Supabase (utiliza as mesmas credenciais definidas globalmente ou no adm_config.js)
const SUPABASE_URL = 'https://pgotayoloyhyufgicvhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3RheW9sb3loeXVmZ2ljdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg1ODAsImV4cCI6MjEwNTQ4NDU4MH0.yrW90hK_8QaR3Y4wAz-M6k9Lw2x7zXiQo0n6TQsHB94';

// Inicializa o cliente do Supabase se já não estiver declarado globalmente
const supabaseAjudaClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Função para buscar todos os relatos de ajuda do Supabase
async function buscarDadosAjudaServidor() {
    try {
        if (!supabaseAjudaClient) throw new Error("Cliente Supabase não inicializado.");

        const { data, error } = await supabaseAjudaClient
            .from('relatos_ajuda')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        
        // Retorna os dados em formato de array ou objeto conforme o seu sistema espera
        return data || [];
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