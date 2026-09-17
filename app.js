document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    calculateLunarPhase();
    updateQuizUI();
    initHoroscope();
});
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    
    // Executa as funções específicas de cada página
    if (document.getElementById('resumo-data')) {
        initDailySummary();
    }
    
    if (document.getElementById('lunar-phase-title')) {
        calculateLunarPhase();
    }
    
    if (document.getElementById('question-text')) {
        updateQuizUI();
    }
    
    if (document.getElementById('sign-detail-box')) {
        initHoroscope();
    }
});

// Lógica de Geração do Resumo Diário Dinâmico
function initDailySummary() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // 1 a 12
    const year = now.getFullYear();

    // 1. Data Formatada
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('resumo-data').textContent = now.toLocaleDateString('pt-BR', options);

    // 2. Signo Solar com base no dia e mês
    let signoSolar = "";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signoSolar = "Áries";
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signoSolar = "Touro";
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signoSolar = "Gêmeos";
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signoSolar = "Câncer";
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signoSolar = "Leão";
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signoSolar = "Virgem";
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signoSolar = "Libra";
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signoSolar = "Escorpião";
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signoSolar = "Sagitário";
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signoSolar = "Capricórnio";
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signoSolar = "Aquário";
    else signoSolar = "Peixes";
    document.getElementById('resumo-signo-solar').textContent = signoSolar;

    // 3. Numerologia do Dia (Soma dos dígitos do dia + mês + ano reduzida a 1 dígito)
    const dateString = `${day}${month}${year}`;
    let sum = 0;
    for (let char of dateString) {
        sum += parseInt(char);
    }
    while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    document.getElementById('resumo-numerologia-badge').textContent = `Número do Dia: ${sum}`;

    const numerologiaDescricoes = {
        1: "Dia de liderança, novos inícios, independência e tomada de iniciativa.",
        2: "Dia de cooperação, diplomacia, sensibilidade e parcerias harmônicas.",
        3: "Dia de expressão artística, comunicação, alegria e criatividade em alta.",
        4: "Dia de foco, organização, trabalho estruturado e bases sólidas.",
        5: "Dia de mudanças, versatilidade, liberdade e magnetismo pessoal.",
        6: "Dia de harmonia no lar, responsabilidade afetiva, cura e estética.",
        7: "Dia de introspecção, estudo aprofundado, intuição e conexão espiritual.",
        8: "Dia de poder pessoal, foco em resultados, finanças e justiça prática.",
        9: "Dia de fechamento de ciclos, desapego, compaixão e humanitarismo.",
        11: "Número Mestre: Alta intuição, iluminação espiritual e inspiração profunda.",
        22: "Número Mestre: Construção em grande escala, pragmatismo e realização de sonhos."
    };
    document.getElementById('resumo-numerologia-desc').textContent = numerologiaDescricoes[sum] || "Dia de transição e alinhamento energético cósmico.";

    // 4. Cálculo da Lua (Aproximação baseada no ciclo sinódico de 29.5 dias)
    const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));
    const diffTime = now.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const normalizedDays = (diffDays % 29.5305877) + 29.5305877;
    const cyclePos = normalizedDays % 29.5305877;

    let luaNome = "";
    let luaDesc = "";
    let signoLunar = "";

    // Array cíclico simples para signo lunar aproximado a cada ~2.5 dias
    const signosZodiaco = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    const signoLunarIndex = Math.floor((cyclePos / 2.5) % 12);
    signoLunar = signosZodiaco[signoLunarIndex];
    document.getElementById('resumo-signo-lunar').textContent = signoLunar;

    if (cyclePos < 3.69) {
        luaNome = "Lua Nova";
        luaDesc = "Energia de recolhimento, silêncio fértil e plantio de novas intenções na escuridão.";
    } else if (cyclePos < 7.38) {
        luaNome = "Lua Crescente";
        luaDesc = "Momento de impulso, desenvolvimento de projetos e absorção de força vital.";
    } else if (cyclePos < 11.07) {
        luaNome = "Quarto Crescente";
        luaDesc = "Superação de obstáculos e tomadas de decisões firmes no caminho.";
    } else if (cyclePos < 14.76) {
        luaNome = "Lua Gibbosa Crescente";
        luaDesc = "Refinamento de ideias e preparação para a culminação e colheita.";
    } else if (cyclePos < 18.45) {
        luaNome = "Lua Cheia";
        luaDesc = "Apogeu energético. Máxima intuição, sensibilidade aflorada e clareza psíquica.";
    } else if (cyclePos < 22.14) {
        luaNome = "Lua Gibbosa Minguante";
        luaDesc = "Gratidão, compartilhamento de sabedoria e reflexão sobre o ciclo.";
    } else if (cyclePos < 25.83) {
        luaNome = "Quarto Minguante";
        luaDesc = "Banho de limpeza profunda, descarte de energias densas e purificação.";
    } else {
        luaNome = "Lua Balsâmica";
        luaDesc = "Descanso profundo, término de ciclos kármicos e meditação silenciosa.";
    }
    document.getElementById('resumo-lua-titulo').textContent = luaNome;
    document.getElementById('resumo-lua-desc').textContent = luaDesc;

    // 5. Tarot, Cor, Erva, Cristal e Santo do dia (Indexados pelo dia do mês)
    const tarotCards = [
        { name: "O Louco", desc: "Coragem para dar o primeiro passo rumo ao desconhecido com fé." },
        { name: "O Mago", desc: "Poder de manifestação, foco e uso das ferramentas ao seu redor." },
        { name: "A Sacerdotisa", desc: "Intuição aguçada, mistérios revelados e sabedoria silenciosa." },
        { name: "A Imperatriz", desc: "Fertilidade, abundância, conexão com a natureza e autocuidado." },
        { name: "O Imperador", desc: "Estrutura, disciplina, ordem e liderança firme sobre os atos." },
        { name: "O Hierofante", desc: "Busca por mentores, tradição, ética e aprendizado espiritual." },
        { name: "Os Enamorados", desc: "Escolhas cruciais guiadas pelo coração e alinhamento de valores." },
        { name: "O Carro", desc: "Vitória através do controle da vontade, foco e direção traçada." },
        { name: "A Justiça", desc: "Equilíbrio, clareza mental, honestidade e consequências justas." },
        { name: "O Eremita", desc: "Busca interior, introspecção e luz própria guiando na solidão." },
        { name: "A Roda da Fortuna", desc: "Ciclos mudando, sincronicidades e surpresas do destino." },
        { name: "A Força", desc: "Domínio das paixões através da doçura, coragem e resiliência." },
        { name: "O Enforcado", desc: "Mudança de perspectiva, pausa necessária e desapego de velhos reflexos." },
        { name: "A Morte", desc: "Transformação profunda, fim de um ciclo e renascimento inevitável." },
        { name: "A Temperança", desc: "Cura, paciência, alquimia interna e harmonia entre opostos." },
        { name: "O Diabo", desc: "Olhar para as próprias sombras, amarras materiais e liberação de vícios." },
        { name: "A Torre", desc: "Queda de ilusões para dar lugar à verdade absoluta e libertação." },
        { name: "A Estrela", desc: "Esperança renovada, inspiração artística, fé e bênçãos celestes." },
        { name: "A Lua", desc: "Navegação por águas inconscientes, sonhos vívidos e intuição profunda." },
        { name: "O Sol", desc: "Vitalidade radiante, alegria, clareza mental e sucesso absoluto." },
        { name: "O Julgamento", desc: "Despertar da consciência, perdão e chamado para um novo nível." },
        { name: "O Mundo", desc: "Conclusão bem-sucedida, realização plena e integração cósmica." }
    ];
    
    const tarotIndex = (day + month) % tarotCards.length;
    document.getElementById('resumo-tarot').textContent = tarotCards[tarotIndex].name;
    document.getElementById('resumo-tarot-desc').textContent = tarotCards[tarotIndex].desc;

    // Cores, Ervas, Cristais e Santos rotativos por dia
    const cores = ["Roxo Profundo", "Verde Esmeralda", "Azul Cobalto", "Dourado Solar", "Vermelho Rubi", "Prata Lunar", "Violeta Místico", "Branco Puro"];
    const ervas = ["Alecrim", "Arruda", "Manjericão", "Hortelã", "Sálvia", "Camomila", "Anis Estrelado", "Guiné"];
    const cristais = ["Ametista", "Quarzo Branco", "Turmalina Negra", "Citrino", "Olho de Tigre", "Selenita", "Jaspe Vermelho", "Quarzo Verde"];
    const santos = ["São Cipriano", "Santa Sara Kali", "São Bento", "Santo Expedito", "Santa Luzia", "São Miguel Arcanjo", "Nossa Senhora das Dores", "São Jorge"];

    document.getElementById('resumo-cor').textContent = cores[day % cores.length];
    document.getElementById('resumo-erva').textContent = ervas[day % ervas.length];
    document.getElementById('resumo-cristal').textContent = cristais[day % cristais.length];
    document.getElementById('resumo-santo').textContent = santos[day % santos.length];
}

// Sistema de Abas (PWA Router Simples)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('header nav button').forEach(el => {
        el.className = "px-3.5 py-1.5 rounded-xl text-xs font-cinzel tracking-wider transition-all bg-purple-950/20 text-slate-400 border border-purple-950/40 hover:text-purple-200";
    });

    document.getElementById(`tab-${tabId}`).classList.add('active');
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "px-3.5 py-1.5 rounded-xl text-xs font-cinzel tracking-wider transition-all bg-purple-900/40 text-purple-200 border border-purple-700/50 shadow-sm";
    }
    lucide.createIcons();
}

// Lógica do Calendário Lunar Automático
function calculateLunarPhase() {
    const now = new Date();
    const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));
    const synodicMonth = 29.53058770576;

    const diffTime = now.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const daysIntoCycle = diffDays % synodicMonth;
    const normalizedDays = (daysIntoCycle + synodicMonth) % synodicMonth;

    let phaseName = "";
    let phaseDesc = "";

    if (normalizedDays < 1.84566) {
        phaseName = "Lua Nova";
        phaseDesc = "Momento de recolhimento, plantio de novas intenções, introspecção e silêncio fértil na escuridão.";
    } else if (normalizedDays < 5.53699) {
        phaseName = "Lua Crescente";
        phaseDesc = "Fase de impulso, desenvolvimento de projetos, fortalecimento da vontade e absorção de energias vitais.";
    } else if (normalizedDays < 9.22831) {
        phaseName = "Quarto Crescente";
        phaseDesc = "Tempo de superação de obstáculos, tomada de decisões firmes e ajustes no caminho espiritual e prático.";
    } else if (normalizedDays < 12.91964) {
        phaseName = "Lua Gibbosa Crescente";
        phaseDesc = "Período de lapidação, refinamento de ideias e preparação para a culminação e colheita.";
    } else if (normalizedDays < 16.61096) {
        phaseName = "Lua Cheia";
        phaseDesc = "Apogeu energético. Máxima intuição, sensibilidade aflorada, clareza psíquica e força em rituais de consagração.";
    } else if (normalizedDays < 20.30229) {
        phaseName = "Lua Gibbosa Minguante";
        phaseDesc = "Momento de gratidão, compartilhamento de sabedoria e início da reflexão sobre o ciclo que se encerra.";
    } else if (normalizedDays < 23.99361) {
        phaseName = "Quarto Minguante";
        phaseDesc = "Fase excelente para banhos de limpeza profunda, descarte de energias densas, cortes e purificação.";
    } else {
        phaseName = "Lua Minguante / Balsâmica";
        phaseDesc = "Descanso profundo, término de ciclos kármicos, meditação e preparação silenciosa para o renascimento.";
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('pt-BR', options);

    const titleEl = document.getElementById('lunar-phase-title');
    const dateEl = document.getElementById('lunar-date-text');
    const descEl = document.getElementById('lunar-description');

    if (titleEl) titleEl.textContent = phaseName;
    if (dateEl) dateEl.textContent = dateStr;
    if (descEl) descEl.textContent = phaseDesc;
}

// Banco de Dados do Teste (30 Perguntas)
const questions = [
    { text: "Toda experiência mística ou espiritual pode ser inteiramente explicada como processos químicos e psicológicos do cérebro.", category: "Ceticismo" },
    { text: "A cura de traumas e o autoconhecimento exigem rigorosamente técnicas científicas de psicologia e terapia baseadas em evidências.", category: "Psicólogo" },
    { text: "A ciência é a única ferramenta legítima para compreender o cosmos; o resto é ilusão mítica.", category: "Ceticismo" },
    { text: "O inconsciente coletivo de Jung abriga arquétipos reais que se manifestam como deuses e mitos na mente.", category: "Psicólogo" },
    { text: "Não possuímos provas racionais da existência de divindades ou planos espirituais, logo o universo é material por padrão.", category: "Agnóstico" },
    { text: "Apenas dogmas religiosos tradicionais oferecem a moralidade correta e a salvação absoluta para a humanidade.", category: "Religioso Extremo" },
    { text: "Desobedecer às leis sagradas e aos mandamentos divinos conduz inevitavelmente à perdição espiritual.", category: "Religioso Extremo" },
    { text: "A moralidade só tem valor real se fundamentada estritamente nas escrituras sagradas de uma fé estruturada.", category: "Religioso Extremo" },
    { text: "Sigo rigorosamente preceitos e rituais de uma religião estabelecida para manter minha paz interior.", category: "Religioso Extremo" },
    { text: "Textos sagrados tradicionais contêm verdades literais inquestionáveis sobre a origem da vida.", category: "Religioso Extremo" },
    { text: "Acredito firmemente que chás, ervas e plantas medicinais possuem princípios ativos e energéticos capazes de curar o corpo e a alma.", category: "Bruxa de Cura / Luz" },
    { text: "Prefiro recorrer a remédios naturais e fitoterapia antes de qualquer intervenção farmacológica sintética.", category: "Bruxa de Cura / Luz" },
    { text: "A natureza guarda segredos fitoterápicos ancestrais que a medicina moderna muitas vezes ignora por completo.", category: "Bruxa de Cura / Luz" },
    { text: "Uso banhos de ervas, chás e aromas com a intenção clara de limpar energias pesadas e melhorar o bem-estar.", category: "Bruxa de Cura / Luz" },
    { text: "O preparo de chás e remédios caseiros com plantas sagradas é um ato de conexão profunda com a terra e cura.", category: "Bruxa de Cura / Luz" },
    { text: "Existe uma energia invisível e universal que pode ser canalizada intencionalmente para manipular a realidade e os eventos.", category: "Mago / Ocultista" },
    { text: "O estudo das sombras da mente e o trabalho com energias densas revelam verdades ocultas que a luz pura ignora.", category: "Mago / Ocultista" },
    { text: "O universo opera através de leis esotéricas que podem ser dominadas por meio da vontade e de rituais.", category: "Mago / Ocultista" },
    { text: "Tenho fascínio por grimórios antigos, símbolos arcanos e sabedorias herméticas proibidas.", category: "Mago / Ocultista" },
    { text: "A transmutação do caos interior em poder pessoal é o verdadeiro objetivo da alta magia.", category: "Mago / Ocultista" },
    { text: "Sinto-me totalmente livre para transitar por diferentes filosofias, religiões e crenças sem me prender a nenhuma instituição.", category: "Espiritualista Livre" },
    { text: "Todas as religiões e caminhos espirituais apontam exatamente para a mesma Verdade Divina universal.", category: "Universalista" },
    { text: "Não afirmo nem nego o divino; prefiro manter a mente aberta apenas ao que é empiricamente verificável no agora.", category: "Agnóstico" },
    { text: "A espiritualidade verdadeira transcende qualquer rótulo religioso, unindo ciência, arte e misticismo.", category: "Universalista" },
    { text: "Práticas de meditação e expansão da consciência permitem acessar dimensões além do tempo-espaço físico.", category: "Espiritualista Livre" },
    { text: "A mente humana possui faculdades parapsicológicas reais, como telepatia, clarividência e intuição premonitória.", category: "Psíquico Sensitivo" },
    { text: "Sou extremamente aberto a conhecer, testar e incorporar novas filosofias de vida, crenças ou terapias alternativas.", category: "Espiritualista Livre" },
    { text: "Fenômenos paranormais e sincronicidades profundas indicam que a realidade material é apenas uma casca.", category: "Psíquico Sensitivo" },
    { text: "A energia das mãos e o poder da intenção focada possuem capacidade de cura energética comprovável na prática.", category: "Psíquico Sensitivo" },
    { text: "Acredito que cada indivíduo pode construir seu próprio caminho espiritual único misturando ciência, magia e natureza.", category: "Espiritualista Livre" }
];

const archetypesRegistry = [
    { name: "Cético Científico", desc: "Focado estritamente na razão, refuta o sobrenatural, crenças mágicas e confia apenas em evidências materiais.", vector: [3, 2, -3, -3, -3, -2, 2, -1] },
    { name: "Religioso Dogmático", desc: "Seguidor estrito de dogmas sagrados, vê na fé tradicional, nas escrituras e na obediência moral o caminho absoluto.", vector: [-3, -2, -3, -3, 3, -3, -2, -3] },
    { name: "Mago / Ocultista", desc: "Investigador das energias densas, grimórios, leis herméticas e da transmutação do caos e das sombras.", vector: [-1, 1, -1, 3, -2, 1, 0, 2] },
    { name: "Bruxa de Cura e Fitoterapia", desc: "Profundamente conectada ao poder das plantas, chás, ervas medicinais, banhos energéticos e ciclos da natureza.", vector: [-1, 1, 3, 1, -2, 1, 1, 1] },
    { name: "Psicólogo Clínico / Analítico", desc: "Fundamentado na estrutura mental, nos arquétipos de Jung, no comportamento humano e no rigor terapêutico.", vector: [2, 3, -2, -1, -2, 1, 1, -1] },
    { name: "Psíquico Sensitivo", desc: "Dotado de alta percepção intuitiva, sensibilidade a energias sutis, clarividência e sincronicidades.", vector: [-1, 1, 1, 2, -2, 1, 2, 3] },
    { name: "Agnóstico Racional", desc: "Suspende julgamentos sobre o divino por falta de provas, mantendo-se neutro, pé no chão e aberto à ciência.", vector: [2, 1, -1, -1, -1, 3, 0, 0] },
    { name: "Espiritualista Livre", desc: "Caminha por sua própria verdade mística, sem amarras institucionais, unindo intuição, natureza e autoconhecimento.", vector: [-1, 1, 2, 1, -3, 0, 3, 2] },
    { name: "Universalista Místico", desc: "Vê a mesma centelha divina e verdade essencial em todas as religiões, filosofias, magias e ciências do mundo.", vector: [-1, 1, 1, 1, -3, -1, 2, 3] }
];

let currentQuestionIndex = 0;
let userAnswers = [];

function updateQuizUI() {
    const questionTextEl = document.getElementById('question-text');
    const questionCategoryEl = document.getElementById('question-category');
    const progressBarEl = document.getElementById('progress-bar');
    
    if (!questionTextEl) return;

    if (currentQuestionIndex < questions.length) {
        const currentQ = questions[currentQuestionIndex];
        questionTextEl.textContent = currentQ.text;
        questionCategoryEl.textContent = `Perspectiva: ${currentQ.category}`;
        const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
        progressBarEl.style.width = `${progressPercentage}%`;
    } else {
        progressBarEl.style.width = `100%`;
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('result-container').classList.remove('hidden');
        calculateProfileMatch();
    }
}

function handleAnswer(scoreValue) {
    userAnswers.push(scoreValue);
    currentQuestionIndex++;
    updateQuizUI();
}

function calculateProfileMatch() {
    let userVector = [
        (userAnswers[0] + userAnswers[2] - userAnswers[4]) / 3,
        (userAnswers[1] + userAnswers[3]) / 2,
        (userAnswers[10] + userAnswers[11] + userAnswers[12] + userAnswers[13] + userAnswers[14]) / 5,
        (userAnswers[15] + userAnswers[16] + userAnswers[17] + userAnswers[18] + userAnswers[19]) / 5,
        (userAnswers[5] + userAnswers[6] + userAnswers[7] + userAnswers[8] + userAnswers[9]) / 5,
        (userAnswers[4] + userAnswers[22]) / 2,
        (userAnswers[20] + userAnswers[24] + userAnswers[26]) / 3,
        (userAnswers[21] + userAnswers[23] + userAnswers[25] + userAnswers[27] + userAnswers[28] + userAnswers[29]) / 6
    ];

    let matches = archetypesRegistry.map(arch => {
        let distance = 0;
        for (let i = 0; i < arch.vector.length; i++) {
            let diff = userVector[i] - arch.vector[i];
            distance += diff * diff;
        }
        let similarity = Math.max(0, Math.round(100 - (Math.sqrt(distance) * 5)));
        return { name: arch.name, desc: arch.desc, similarity: similarity };
    });

    matches.sort((a, b) => b.similarity - a.similarity);

    let primary = matches[0];
    document.getElementById('result-title').textContent = primary.name;
    document.getElementById('result-description').textContent = primary.desc;

    const matchListEl = document.getElementById('match-list');
    matchListEl.innerHTML = "";
    matches.slice(0, 4).forEach((m, idx) => {
        matchListEl.innerHTML += `
            <div class="flex justify-between items-center bg-[#07050c] p-2.5 rounded-lg border border-purple-950/40">
                <span class="font-cinzel text-purple-200">${idx + 1}. ${m.name}</span>
                <span class="font-bold text-indigo-400">${m.similarity}% de Proximidade</span>
            </div>
        `;
    });
}

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    updateQuizUI();
}

// Banco de Dados de Perfis Zodiacais (Horóscopo Fixo / Arquétipo dos Signos)
const signsData = {
    aries: {
        name: "Áries",
        element: "Elemento Fogo • Regido por Marte",
        dates: "21 Março - 19 Abril",
        essence: "Arquétipo do Pioneiro e do Guerreiro. Possui uma força vital implacável, coragem inata e uma urgência natural para iniciar jornadas, quebrar barreiras e liderar pelo exemplo. A impulsividade é sua marca motriz.",
        shadow: "A impaciência crônica, a tendência à agressividade quando contrariado e o egoísmo impulsivo que ignora o coletivo em prol do desejo imediato."
    },
    touro: {
        name: "Touro",
        element: "Elemento Terra • Regido por Vênus",
        dates: "20 Abril - 20 Maio",
        essence: "Arquétipo do Construtor e do Guardião da Matéria. Possui profunda conexão com os sentidos, estabilidade inabalável, valorização do conforto e uma paciência férrea para cultivar frutos sólidos.",
        shadow: "A teimosia inflexível, a resistência extrema a qualquer mudança e o apego excessivo a posses e pessoas."
    },
    gemeos: {
        name: "Gêmeos",
        element: "Elemento Ar • Regido por Mercúrio",
        dates: "21 Maio - 20 Junho",
        essence: "Arquétipo do Mensageiro e do Alquimista Mental. Curiosidade insaciável, agilidade intelectual, facilidade camaleônica para absorver informações e conectar ideias distantes.",
        shadow: "A dispersão mental crônica, a superficialidade nos vínculos e a dualidade ansiosa que impede o aprofundamento."
    },
    cancer: {
        name: "Câncer",
        element: "Elemento Água • Regido pela Lua",
        dates: "21 Junho - 22 Julho",
        essence: "Arquétipo da Grande Mãe e do Protetor do Santuário. Profundidade emocional incomparável, intuição visceral, memória ancestral afiada e talento para nutrir e acolher.",
        shadow: "O apego excessivo ao passado, o melodrama vitimista e a manipulação sutil através da culpa e do recolhimento defensivo."
    },
    leao: {
        name: "Leão",
        element: "Elemento Fogo • Regido pelo Sol",
        dates: "23 Julho - 22 Agosto",
        essence: "Arquétipo do Soberano e do Criador Magnético. Brilho pessoal radiante, generosidade grandiosa, nobreza de espírito e necessidade inata de expressar a própria autenticidade com arte.",
        shadow: "A vaidade frágil, a dependência crônica de validação externa e a arrogância quando sua autoridade é questionada."
    },
    virgem: {
        name: "Virgem",
        element: "Elemento Terra • Regido por Mercúrio",
        dates: "23 Agosto - 22 Setembro",
        essence: "Arquétipo do Analista e do Curador Prático. Olhar clínico impecável, devoção ao serviço útil, busca incessante pelo aprimoramento e inteligência voltada à ordem.",
        shadow: "O perfeccionismo paralisante, a autocrítica destrutiva e a mania de controle sobre os mínimos detalhes alheios."
    },
    libra: {
        name: "Libra",
        element: "Elemento Ar • Regido por Vênus",
        dates: "23 Setembro - 22 Outubro",
        essence: "Arquétipo do Juiz, do Diplomata e do Esteta. Busca harmonia absoluta, justiça, beleza nas formas e compreende profundamente a alteridade e o espelhamento nas relações.",
        shadow: "A indecisão crônica, o medo profundo de conflitos a ponto de anular a própria voz e a dependência da opinião alheia."
    },
    escorpiao: {
        name: "Escorpião",
        element: "Elemento Água • Regido por Plutão / Marte",
        dates: "23 Outubro - 21 Novembro",
        essence: "Arquétipo do Fênix e do Investigador do Oculto. Domínio sobre os tabus, coragem para mergulhar nas profundezas da sombra humana, magnetismo avassalador e capacidade de transmutação total.",
        shadow: "A desconfiança paranoica, o rancor implacável, o controle obsessivo e a tendência à autodestruição em crises."
    },
    sagitario: {
        name: "Sagitário",
        element: "Elemento Fogo • Regido por Júpiter",
        dates: "22 Novembro - 21 Dezembro",
        essence: "Arquétipo do Filósofo e do Explorador Cósmico. Visão de longo alcance, otimismo inabalável, busca por verdades superiores, liberdade espiritual e expansão de horizontes.",
        shadow: "O dogmatismo velado disfarçado de verdade absoluta, a irresponsabilidade com prazos e a franqueza excessiva que fere sem empatia."
    },
    capricornio: {
        name: "CapricórniO",
        element: "Elemento Terra • Regido por Saturno",
        dates: "22 Dezembro - 19 Janeiro",
        essence: "Arquétipo do Mestre de Obras e do Estrategista do Tempo. Ambição inquebrantável, disciplina rigorosa, maturidade precoce e maestria na construção de legados duradouros.",
        shadow: "O pessimismo frio, a rigidez emocional excessiva e a obsessão por status e trabalho em detrimento da vida íntima."
    },
    aquario: {
        name: "Aquário",
        element: "Elemento Ar • Regido por Urano / Saturno",
        dates: "20 Janeiro - 18 Fevereiro",
        essence: "Arquétipo do Visionário e do Reformador Social. Intelecto futurista, independência radical, preocupação genuína com a coletividade e quebra de padrões obsoletos.",
        shadow: "A frieza emocional com indivíduos concretos em prol de ideias abstratas, a arrogância intelectual e a rebeldia sem causa."
    },
    peixes: {
        name: "Peixes",
        element: "Elemento Água • Regido por Netuno / Júpiter",
        dates: "19 Fevereiro - 20 Março",
        essence: "Arquétipo do Místico e do Poeta Cósmico. Conexão direta com o inconsciente coletivo, compaixão infinita, sensibilidade artística e dissolução de fronteiras egoicas.",
        shadow: "A tendência ao escapismo da realidade dura, a vitimização crônica e a falta de limites claros, absorvendo cargas energéticas alheias."
    }
};

function initHoroscope() {
    // Exibe a data atual no topo da aba de horóscopo
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateBadge = document.getElementById('current-date-badge');
    if (dateBadge) {
        dateBadge.textContent = `Hoje: ${now.toLocaleDateString('pt-BR', options)}`;
    }

    // Seleciona Áries por padrão ao abrir a aba
    selectSign('aries');
}

function selectSign(signKey) {
    // Remove o destaque de todos os botões de signos
    document.querySelectorAll('.sign-btn').forEach(btn => {
        btn.className = "sign-btn p-3 rounded-xl bg-[#07050c] border border-purple-950 hover:border-purple-700 text-xs font-cinzel text-purple-200 transition-all text-center";
    });

   // Destaca o botão selecionado
   const selectedBtn = document.getElementById(`sign-btn-${signKey}`);
   if (selectedBtn) {
     selectedBtn.className = "sign-btn p-3 rounded-xl bg-purple-900/40 border border-purple-700 text-xs font-cinzel text-purple-100 transition-all text-center shadow-md";
   }
   
   const data = signsData[signKey];
   if (data) {
     document.getElementById('sign-name').textContent = data.name;
     document.getElementById('sign-element').textContent = data.element;
     document.getElementById('sign-dates').textContent = data.dates;
     document.getElementById('sign-essence').textContent = data.essence;
     document.getElementById('sign-shadow').textContent = data.shadow;
   }
   }
