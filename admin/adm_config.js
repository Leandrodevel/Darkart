// ==========================================
// CONFIGURAÇÃO DE CONEXÃO SUPABASE - ADM_CONFIG.JS
// ==========================================

const SUPABASE_URL = 'https://pgotayoloyhyufgicvhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3RheW9sb3loeXVmZ2ljdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg1ODAsImV4cCI6MjEwNTQ4NDU4MH0.yrW90hK_8QaR3Y4wAz-M6k9Lw2x7zXiQo0n6TQsHB94';

// Inicializa o cliente do Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função auxiliar para obter a data atual no formato ISO (YYYY-MM-DD)
function obterDataHojeIso() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}
window.addEventListener('load', async () => {
    const dataHoje = obterDataHojeIso();
    // Lógica para apagar mensagens do dia anterior
                
                // Opcional: Remove mensagens anteriores ao dia de hoje para manter apenas o dia atual no banco
                await supabaseClient.from('mensagens_dia').delete().lt('data_iso', dataHoje);
                await supabaseClient.from('videos_dia').delete().lt('data', dataHoje);

}

// Função genérica unificada para requisições compatível com a estrutura anterior
async function apiRequisicao(recurso, metodo = 'GET', dados = null, id = null) {
    try {
        let res;
        
        if (metodo === 'GET') {
            let query = supabaseClient.from(recurso).select('*');
            
            // Se houver um ID específico, aplica o filtro (considerando colunas padrão 'id' ou 'data')
            if (id !== null) {
                const colunaId = (recurso === 'videos_dia') ? 'data' : 'id';
                query = query.eq(colunaId, id);
            }
            
            res = await query;
            if (res.error) throw res.error;
            return res.data;
        } 
        
        else if (metodo === 'POST' || metodo === 'PUT') {
            // Verifica a ação enviada pelo payload antigo para mapear corretamente no Supabase
            if (dados.acao === 'excluir_registro') {
                const colunaId = (dados.tabela === 'videos_dia') ? 'data' : 'id';
                res = await supabaseClient.from(dados.tabela).delete().eq(colunaId, dados.id);
            } 
            else if (dados.acao === 'salvar_video_dia') {
                  const dataHoje = obterDataHojeIso();
                
                // Opcional: Remove mensagens anteriores ao dia de hoje para manter apenas o dia atual no banco
                await supabaseClient.from('videos_dia').delete().lt('data', dataHoje);
                res = await supabaseClient.from('videos_dia').upsert([dados]);
            }
            else if (dados.acao === 'enviar_mensagem') {
                const dataHoje = obterDataHojeIso();
                
                // Opcional: Remove mensagens anteriores ao dia de hoje para manter apenas o dia atual no banco
                await supabaseClient.from('mensagens_dia').delete().lt('data_iso', dataHoje);

                // Insere a nova mensagem do dia
                res = await supabaseClient.from('mensagens_dia').insert([{
                    data_iso: dados.dataIso || dataHoje,
                    horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    texto: dados.texto,
                    reacao_coracao: 0,
                    reacao_amem: 0,
                    reacao_flor: 0
                }]);
            }
            else if (dados.acao === 'salvar_mensagem_autor') {
                // Remove todas as mensagens de autor anteriores para garantir que fique apenas a atual (substituição)
                await supabaseClient.from('mensagens_autor').delete().neq('id', 0); // ou delete de todas

                // Insere a nova mensagem do autor
                res = await supabaseClient.from('mensagens_autor').insert([{
                    autor: dados.autor,
                    data: dados.data,
                    texto: dados.texto
                }]);
            }
            else if (dados.acao === 'responder_relato') {
                res = await supabaseClient.from('relatos_ajuda').update({
                    resposta: dados.resposta
                }).eq('id', dados.id);
            }
            else if (dados.acao === 'cadastrar_admin') {
                res = await supabaseClient.from('admins').insert([{
                    id: dados.id,
                    apelido: dados.apelido,
                    senha: dados.senha,
                    nivel: dados.nivel || 'Admin'
                }]);
            } 
            else {
                // Inserção/Atualização genérica padrão
                res = await supabaseClient.from(recurso).upsert([dados]);
            }

            if (res.error) throw res.error;
            return { sucesso: true, data: res.data };
        } 
        
        else if (metodo === 'DELETE') {
            const colunaId = (recurso === 'videos_dia') ? 'data' : 'id';
            res = await supabaseClient.from(recurso).delete().eq(colunaId, id);
            if (res.error) throw res.error;
            return { sucesso: true };
        }

    } catch (erro) {
        console.error(`Erro na operação Supabase [${metodo}] para [${recurso}]:`, erro);
        return { sucesso: false, erro: erro.message };
    }
}

// Funções globais de acesso às tabelas mantidas para total compatibilidade com o adm.js
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