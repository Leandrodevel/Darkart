let questions = [];
let currentQuestionIndex = 0;
let userScores = {}; // Armazena a pontuação somada por categoria

// Elementos do DOM
const questionText = document.getElementById("question-text");
const questionCategory = document.getElementById("question-category");
const progressBar = document.getElementById("progress-bar");
const quizContainer = document.getElementById("quiz-container");
const resultContainer = document.getElementById("result-container");
const resultTitle = document.getElementById("result-title");
const resultDescription = document.getElementById("result-description");
const matchList = document.getElementById("match-list");

// Mapeamento de Arquétipos do Sistema com base nas categorias do quiz
const archetypesMapping = [
    {
        title: "O Místico Universalista",
        keywords: ["Universalismo", "Budismo", "Evolução e Consciência", "Fé Racional", "Propósito de Vida"],
        description: "Sua alma busca a síntese entre todas as filosofias. Você compreende que a verdade divina transcende dogmas fechados, valorizando a meditação, a expansão da consciência e a fraternidade cósmica.",
        traits: ["Visão integrativa", "Busca pela iluminação", "Conexão cósmica universal"]
    },
    {
        title: "O Guardião da Alquimia Interior",
        keywords: ["Psicologia e Sombra", "Hermetismo e Leis Universais", "Hermetismo e Alquimia", "Psicologia e Autoconhecimento", "Misticismo Prático"],
        description: "Você entende a espiritualidade através da maestria mental e do autoconhecimento profundo. Acolhe suas sombras, domina as leis herméticas e transmuta desafios em pura evolução.",
        traits: ["Maturidade psicológica", "Domínio das leis mentais", "Autonomia espiritual"]
    },
    {
        title: "O Sacerdote da Terra (Ervas e Cristais)",
        keywords: ["Magia Natural (Ervas)", "Cristais e Radiestesia", "Cura Ancestral", "Sintonia Vibracional", "Energia e Intuição"],
        description: "Sua conexão com o sagrado passa pelos elementos da natureza. Você manipula com respeito a frequência dos cristais, a força das ervas e as medicinas ancestrais para purificar e proteger.",
        traits: ["Intuição apurada", "Magia natural prática", "Respeito à ancestralidade"]
    },
    {
        title: "O Peregrino da Caridade e Luz",
        keywords: ["Espiritismo e Reencarnação", "Espiritismo e Caridade", "Umbanda e Orixás", "Umbanda e Caridade", "Sustentação Espiritual Geral"],
        description: "Sua jornada é guiada pelo amparo, pela caridade ativa e pela crença na evolução contínua do espírito através de múltiplas existências, contando sempre com o auxílio dos guias e mentores.",
        traits: ["Amor ao próximo", "Firmeza na caridade", "Sintonia com mentores espirituais"]
    },
    {
        title: "O Alquimista Energético (Reiki e Frequência)",
        keywords: ["Reiki e Energia Vital", "Reiki e Autocura", "Lei da Atração e Frequência", "Lei da Atração e Cocriação", "Equilíbrio Material e Espiritual"],
        description: "Você opera como um canal de frequências sutis. Compreende que a energia vital, a imposição de mãos e o poder mental de cocriação moldam diretamente a realidade material e espiritual.",
        traits: ["Canal de cura energética", "Cocriação consciente", "Harmonização vibracional"]
    }
];

// Carrega o arquivo quiz.json ao iniciar
async function loadQuizData() {
    try {
        const response = await fetch('quiz.json');
        const data = await response.json();
        questions = data.questions;
        loadQuestion();
    } catch (error) {
        console.error("Erro ao carregar o arquivo quiz.json:", error);
        if (questionText) {
            questionText.textContent = "Erro ao carregar as perguntas. Verifique se o arquivo quiz.json está na mesma pasta.";
        }
    }
}

// Exibe a pergunta atual
function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const q = questions[currentQuestionIndex];
        questionCategory.textContent = q.category;
        questionText.textContent = q.text;
        
        // Atualiza a barra de progresso (de 1 a 30)
        const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    } else {
        calculateResults();
    }
}

// Armazena a pontuação e avança para a próxima
function handleAnswer(score) {
    const currentQ = questions[currentQuestionIndex];
    const category = currentQ.category;

    // Inicializa a categoria se não existir
    if (!userScores[category]) {
        userScores[category] = 0;
    }
    
    // Soma o valor escolhido (-3 a +3)
    userScores[category] += score;

    currentQuestionIndex++;
    loadQuestion();
}

// Calcula o arquétipo mais compatível com base nas respostas
function calculateResults() {
    quizContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    progressBar.style.width = "100%";

    // Avalia qual arquétipo possui maior pontuação somada nas suas keywords correspondentes
    let bestMatch = archetypesMapping[0];
    let highestScore = -9999;

    archetypesMapping.forEach(arch => {
        let archScore = 0;
        arch.keywords.forEach(kw => {
            if (userScores[kw]) {
                archScore += userScores[kw];
            }
        });

        if (archScore > highestScore) {
            highestScore = archScore;
            bestMatch = arch;
        }
    });

    // Exibe o resultado na tela
    resultTitle.textContent = bestMatch.title;
    resultDescription.textContent = bestMatch.description;

    // Renderiza os traços do arquétipo indicado
    matchList.innerHTML = "";
    bestMatch.traits.forEach(trait => {
        const item = document.createElement("div");
        item.className = "flex items-center gap-2 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-100 text-emerald-900";
        item.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-700"></i> <span>${trait}</span>`;
        matchList.appendChild(item);
    });

    // Recria os ícones do Lucide inseridos dinamicamente
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Reinicia o quiz do zero
function restartQuiz() {
    currentQuestionIndex = 0;
    userScores = {};
    resultContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    loadQuestion();
}

// Inicializa ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    loadQuizData();
});
