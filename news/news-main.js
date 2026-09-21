// news/news-main.js
import { supabase } from './news-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa os ícones do Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Carregar matérias anteriores do Supabase para a seção inferior estilo revista
    await carregarMateriasAnteriores();
});

async function carregarMateriasAnteriores() {
    const containerCards = document.getElementById('grid-materias-anteriores');
    if (!containerCards) return;

    try {
        // Exemplo de consulta ao Supabase na tabela 'materias'
        const { data: materias, error } = await supabase
            .from('materias')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3); // Traz as 3 últimas matérias para os cards

        if (error) {
            console.error('Erro ao buscar matérias:', error.message);
            return;
        }

        if (materias && materias.length > 0) {
            containerCards.innerHTML = ''; // Limpa o conteúdo estático de exemplo

            materias.forEach(materia => {
                const cardHTML = `
                    <article class="bg-slate-50/80 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div class="h-36 overflow-hidden bg-slate-200">
                                <img src="${materia.imagem_url || '../img/default.jpg'}" alt="${materia.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            </div>
                            <div class="p-4 space-y-2">
                                <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">${materia.categoria || 'Geral'}</span>
                                <h4 class="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors leading-snug">
                                    ${materia.titulo}
                                </h4>
                                <p class="text-xs text-slate-600 line-clamp-2">
                                    ${materia.resumo || ''}
                                </p>
                            </div>
                        </div>
                        <div class="p-4 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 mt-2">
                            <span>${new Date(materia.created_at).toLocaleDateString('pt-BR')}</span>
                            <a href="materia.html?id=${materia.id}" class="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                                Ler artigo <i data-lucide="chevron-right" class="w-3 h-3"></i>
                            </a>
                        </div>
                    </article>
                `;
                containerCards.innerHTML += cardHTML;
            });

            // Reativa os ícones para os elementos injetados dinamicamente
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    } catch (err) {
        console.error('Erro inesperado ao carregar matérias do Supabase:', err);
    }
}
