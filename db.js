// Configurações do Banco JSON Online (JSONBin.io)
const BIN_ID = 'SEU_BIN_ID_AQUI';
const API_KEY = 'SUA_API_KEY_AQUI';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Dicionários de Significados
const SIGNIFICADOS_NUMEROS = {
    1: "Liderança, novos começos, independência e inovação.",
    2: "Cooperação, diplomacia, sensibilidade e parcerias.",
    3: "Expressão criativa, alegria, comunicação e expansão.",
    4: "Estrutura, organização, estabilidade e trabalho árduo.",
    5: "Mudança, liberdade, versatilidade e novas experiências.",
    6: "Harmonia, amor familiar, responsabilidade e cuidado.",
    7: "Espiritualidade, introspecção, sabedoria e análise.",
    8: "Poder pessoal, realização material, justiça e abundância.",
    9: "Conclusão de ciclos, compaixão, universalidade e generosidade."
};

const SIGNIFICADOS_LUAS = {
    "Nova": "Momento de plantio, introspecção, definição de intenções e novos começos.",
    "Crescente": "Fase de expansão, foco, desenvolvimento de projetos e tomada de ação.",
    "Cheia": "Período de máxima energia, intuição acentuada, clareza e culminação de objetivos.",
    "Minguante": "Tempo de limpeza, desapego, encerramentos, descanso e reflexão interna."
};

const SIGNIFICADOS_CORES = {
    "Verde Oliva": "Traz harmonia, regeneração, equilíbrio com a natureza e paz interior.",
    "Azul Sereno": "Favorece a tranquilidade mental, a comunicação pacífica e a cura emocional.",
    "Dourado Solar": "Atrai vitalidade, prosperidade, sucesso, brilho pessoal e confiança.",
    "Violeta Místico": "Estimula a transmutação de energias densas, a espiritualidade e a intuição.",
    "Branco Cristalino": "Promove a limpeza energética, a pureza de pensamentos e a paz de espírito.",
    "Terracota": "Conecta com a terra, trazendo estabilidade, firmeza, segurança e aterramento.",
    "Prata Lunar": "Estimula a sensibilidade, o mundo onírico, a intuição e o fluxo emocional.",
    "Rosa Magenta": "Favorece o amor incondicional, a compaixão, a autoestima e a afetuosidade."
};

const SIGNIFICADOS_ARCANOS = {
    "O Mago": "Poder de manifestação, habilidade, foco e o uso consciente dos recursos para criar a própria realidade.",
    "A Sacerdotisa": "Sabedoria oculta, intuição profunda, mistério e a necessidade de escutar a voz interior.",
    "A Imperatriz": "Abundância, fertilidade, criatividade, conexão com a natureza e acolhimento.",
    "O Imperador": "Autoridade, estrutura, estabilidade, liderança e capacidade de organizar o caos.",
    "O Hierofante": "Tradição, busca espiritual, ensinamentos elevados e conexão com valores morais.",
    "Os Enamorados": "Escolhas importantes, união, alinhamento de valores e caminhos do coração.",
    "O Carro": "Superação de obstáculos, determinação, foco no objetivo e vitória através da vontade.",
    "A Justiça": "Equilíbrio, verdade, causa e efeito, clareza e decisões ponderadas.",
    "O Ermitão": "Busca interior, solidão construtiva, autoconhecimento e iluminação espiritual.",
    "A Roda da Fortuna": "Ciclos da vida, mudanças inevitáveis, destino e oportunidades favoráveis.",
    "A Força": "Coragem, domínio dos instintos pela compaixão, resiliência e paciência.",
    "O Enforcado": "Parada necessária, mudança de perspectiva, entrega e aprendizado pelo silêncio.",
    "A Morte": "Transformação profunda, fim de um ciclo e renascimento para uma nova fase.",
    "A Temperança": "Equilíbrio, paciência, moderação, cura e harmonia entre os opostos.",
    "O Diabo": "Enfrentamento de sombras, apegos materiais, libertação de amarras e paixões intensas.",
    "A Torre": "Queda de velhas estruturas ilusórias, revelação repentina e libertação necessária.",
    "A Estrela": "Esperança, inspiração, fé no futuro, renovação e bênçãos do cosmos.",
    "A Lua": "Ilusões, intuição aguçada, sonhos e o desbravamento do inconsciente e dos medos.",
    "O Sol": "Alegria, vitalidade, clareza, sucesso e a luz da verdade brilhando intensamente.",
    "O Julgamento": "Despertar espiritual, chamado interior, absolvição e avaliação de escolhas passadas.",
    "O Mundo": "Conclusão bem-sucedida de um grande ciclo, realização plena e integração.",
    "O Louco": "Aventuras, fé no desconhecido, coragem para dar o primeiro passo e pureza de intenção."
};

const SIGNIFICADOS_CRISTAIS = {
    "Quartzo Verde": "Promove a saúde física e mental, o equilíbrio emocional e a esperança.",
    "Ametista": "Eleva a espiritualidade, acalma a mente ansiosa e protege energeticamente.",
    "Citrino": "Atrai abundância financeira, alegria de viver e poder pessoal.",
    "Turmalina Negra": "Poderoso escudo protetor contra energias densas e inveja.",
    "Selenita": "Limpa e purifica o campo energético e promove conexão com planos superiores.",
    "Olho de Tigre": "Gera coragem, foco, proteção e firmeza diante de desafios.",
    "Quartzo Rosa": "Abre o chakra do coração para o amor próprio e harmonia nas relações.",
    "Ágata Azul": "Facilita a expressão verbal clara, a calma e a paz na mente.",
    "Jaspe Vermelho": "Aterra as energias, traz vitalidade física, força e determinação."
};

const SIGNIFICADOS_RUNAS = {
    "Fehu (Abundância)": "Representa riqueza material e espiritual, conquistas e prosperidade.",
    "Uruz (Força)": "Símbolo de vitalidade indomável, saúde robusta e coragem física.",
    "Thurisaz (Proteção)": "Filtro contra energias nocivas; momento de cautela e defesa consciente.",
    "Ansuz (Sabedoria)": "Conexão com a comunicação divina, inspiração e conselhos sábios.",
    "Raidho (Jornada)": "Indica viagens físicas ou espirituais, movimento e rumo certo na vida.",
    "Kano (Iluminação)": "Clareza mental, criatividade acesa, solução de problemas e fogo interior.",
    "Gebo (Parceria)": "Símbolo de dádivas, união harmoniosa, parcerias e reciprocidade.",
    "Wunjo (Alegria)": "Paz de espírito, harmonia, satisfação e contentamento após o esforço.",
    "Hagalaz (Transformação)": "Mudança radical e inevitável que limpa o caminho para o novo.",
    "Nauthiz (Superação)": "Lições de resiliência, paciência e força perante a escassez ou testes.",
    "Isa (Paciencia)": "Momento de congelamento e pausa estratégica; recolhimento necessário.",
    "Jera (Colheita)": "Recompensa merecida pelos frutos do trabalho realizado no tempo certo.",
    "Eihwaz (Resiliência)": "Proteção espiritual, estabilidade e capacidade de suportar transições."
};

const SIGNIFICADOS_SANTOS = {
    "Santa Hildegard": "Inspira a cura natural, a arte sacra, a sabedoria e o estudo da criação.",
    "São Francisco de Assis": "Evoca a humildade, o amor profundo pelos animais, a paz e a simplicidade.",
    "Santo Agostinho": "Reflete a busca interior pela verdade, o intelecto devoto e a conversão do coração.",
    "Santa Teresa d'Ávila": "Simboliza a oração contemplativa, a força da alma e o castelo interior.",
    "São Bento": "Conhecido pela forte proteção espiritual contra o mal e foco na disciplina.",
    "Santa Rita de Cássia": "A santa das causas impossíveis, trazendo paciência, fé inabalável e perdão.",
    "São Tomé de Aquino": "Padroeiro dos estudantes, unindo a fé racional com a sabedoria divina.",
    "Santa Clara": "Exemplo de luz, clarividência espiritual, desprendimento e firmeza na fé.",
    "Santo Antônio": "Focado na caridade, na união, no zelo pelos necessitados e nas causas justas."
};

const SIGNIFICADOS_ASTRO = {
    "Sol em Capricórnio / Lua em Áries": "Energia de iniciativa aliada à disciplina e foco nos objetivos.",
    "Sol em Capricórnio / Lua em Touro": "Estabilidade material, praticidade e busca por segurança a longo prazo.",
    "Sol em Aquário / Lua em Gêmeos": "Mente altamente inventiva, comunicação fluida e sede por novidades.",
    "Sol em Peixes / Lua em Câncer": "Profunda sensibilidade emocional, intuição aguçada e acolhimento.",
    "Sol em Áries / Lua em Leão": "Fogo, paixão, liderança natural e muita energia para realizar.",
    "Sol em Touro / Lua em Virgem": "Pragmatismo, atenção aos detalhes, organização e foco no trabalho.",
    "Sol em Gêmeos / Lua em Libra": "Sociabilidade, charme, busca por harmonia e trocas intelectuais.",
    "Sol em Câncer / Lua em Escorpião": "Intensidade emocional, proteção familiar e forte conexão com o oculto.",
    "Sol em Leão / Lua em Sagitário": "Otimismo expansivo, alegria contagiante, generosidade e visão ampla.",
    "Sol em Virgem / Lua em Capricórnio": "Senso crítico construtivo, eficiência, método e foco em resultados sólidos.",
    "Sol em Libra / Lua em Aquário": "Senso de justiça comunitária, inovação relacional e diplomacia.",
    "Sol em Escorpião / Lua em Peixes": "Poder de regeneração, espiritualidade mística e transmutação profunda."
};

// 1. Função de cálculo da Numerologia
function calcularNumerologiaDoDia(diaStr, mesStr, anoStr) {
    const somaDigitos = (str) => str.split('').reduce((acc, char) => acc + parseInt(char, 10), 0);
    let total = somaDigitos(diaStr) + somaDigitos(mesStr) + somaDigitos(anoStr);

    while (total > 9) {
        total = String(total).split('').reduce((acc, char) => acc + parseInt(char, 10), 0);
    }

    return {
        valor: String(total),
        significado: SIGNIFICADOS_NUMEROS[total] || "Energia de transformação e equilíbrio."
    };
}

// 2. Função geradora do banco anual 2026 estruturado
function gerarBancoAnual2026() {
    const astrologias = Object.keys(SIGNIFICADOS_ASTRO);
    const cores = Object.keys(SIGNIFICADOS_CORES);
    const luasNomes = Object.keys(SIGNIFICADOS_LUAS);
    const arcanosNomes = Object.keys(SIGNIFICADOS_ARCANOS);
    const cristaisNomes = Object.keys(SIGNIFICADOS_CRISTAIS);
    const runasNomes = Object.keys(SIGNIFICADOS_RUNAS);
    const santosNomes = Object.keys(SIGNIFICADOS_SANTOS);
    
    const videos = [
        { titulo: "A Senda do Autoconhecimento e Magia Natural", descricao: "Reflexão sobre as energias sutis que nos circundam no dia de hoje.", youtubeId: "dQw4w9WgXcQ" },
        { titulo: "O Poder do Silêncio Interior", descricao: "Como silenciar a mente para ouvir a voz da intuição e do alto.", youtubeId: "dQw4w9WgXcQ" },
        { titulo: "A Alquimia dos Pensamentos Diários", descricao: "Transformando energias densas em frequências de luz e paz.", youtubeId: "dQw4w9WgXcQ" }
    ];

    let db = {};
    let dataAtual = new Date(2026, 0, 1);
    let dataFim = new Date(2026, 11, 31);
    let i = 0;

    while (dataAtual <= dataFim) {
        let anoStr = String(dataAtual.getFullYear());
        let mesStr = String(dataAtual.getMonth() + 1).padStart(2, '0');
        let diaStr = String(dataAtual.getDate()).padStart(2, '0');
        
        let chaveIso = `${anoStr}-${mesStr}-${diaStr}`;
        let dataFormatada = `${diaStr}/${mesStr}/${anoStr}`;

        let numerologia = calcularNumerologiaDoDia(diaStr, mesStr, anoStr);
        let astroNome = astrologias[i % astrologias.length];
        let corNome = cores[i % cores.length];
        let luaNome = luasNomes[Math.floor(i / 7) % luasNomes.length];
        let arcanoNome = arcanosNomes[i % arcanosNomes.length];
        let cristalNome = cristaisNomes[i % cristaisNomes.length];
        let runaNome = runasNomes[i % runasNomes.length];
        let santoNome = santosNomes[i % santosNomes.length];

        db[chaveIso] = {
            videoDoDia: videos[i % videos.length],
            resumoDiario: {
                data: dataFormatada,
                astrologia: {
                    valor: astroNome,
                    significado: SIGNIFICADOS_ASTRO[astroNome]
                },
                cor: {
                    nome: corNome,
                    significado: SIGNIFICADOS_CORES[corNome]
                },
                lua: {
                    fase: luaNome,
                    significado: SIGNIFICADOS_LUAS[luaNome]
                },
                numero: {
                    valor: numerologia.valor,
                    significado: numerologia.significado
                },
                arcano: {
                    nome: arcanoNome,
                    significado: SIGNIFICADOS_ARCANOS[arcanoNome]
                },
                cristal: {
                    nome: cristalNome,
                    significado: SIGNIFICADOS_CRISTAIS[cristalNome]
                },
                runa: {
                    nome: runaNome,
                    significado: SIGNIFICADOS_RUNAS[runaNome]
                },
                santo: {
                    nome: santoNome,
                    significado: SIGNIFICADOS_SANTOS[santoNome]
                }
            }
        };

        dataAtual.setDate(dataAtual.getDate() + 1);
        i++;
    }

    return db;
}

const BANCO_ANUAL_2026 = gerarBancoAnual2026();

function obterChaveDataHoje() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

async function buscarDadosDoBanco() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });

        if (!response.ok) throw new Error('Erro ao carregar dados do JSON online');

        const data = await response.json();
        const hojeChave = obterChaveDataHoje();
        const dadosDoDia = data.record[hojeChave] || data.record;

        return {
            sucesso: true,
            dados: dadosDoDia
        };

    } catch (error) {
        console.warn("Usando banco de dados anual local (Modo Fallback):", error);
        
        const hojeChave = obterChaveDataHoje();
        const dadosDoDia = BANCO_ANUAL_2026[hojeChave] || BANCO_ANUAL_2026["2026-01-01"];

        return {
            sucesso: false,
            dados: dadosDoDia
        };
    }
}
