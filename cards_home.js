// astrologia.js / cards_home.js - Funções de Astrologia, Fase da Lua e Numerologia

function setTextoSeExistir(id, texto) {
    const el = document.getElementById(id);
    if (el) el.innerText = texto;
}

function calcularSignoSolar(data) {
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    let signo = "Peixes", significado = "Foco em sensibilidade, intuição e conclusão de ciclos sutis.";
    
    if ((mes == 3 && dia >= 21) || (mes == 4 && dia <= 19)) { signo = "Áries"; significado = "Energia de coragem, impulso, liderança e iniciativa renovada."; }
    else if ((mes == 4 && dia >= 20) || (mes == 5 && dia <= 20)) { signo = "Touro"; significado = "Constância, valorização dos sentidos, foco prático e solidez."; }
    else if ((mes == 5 && dia >= 21) || (mes == 6 && dia <= 20)) { signo = "Gêmeos"; significado = "Curiosidade intelectual, versatilidade, trocas e comunicação fluida."; }
    else if ((mes == 6 && dia >= 21) || (mes == 7 && dia <= 22)) { signo = "Câncer"; significado = "Acolhimento emocional, conexão com as raízes, intuição e proteção."; }
    else if ((mes == 7 && dia >= 23) || (mes == 8 && dia <= 22)) { signo = "Leão"; significado = "Brilho pessoal, expressão criativa, autoconfiança e generosidade."; }
    else if ((mes == 8 && dia >= 23) || (mes == 9 && dia <= 22)) { signo = "Virgem"; significado = "Organização mental, foco nos detalhes, aprimoramento e utilidade."; }
    else if ((mes == 9 && dia >= 23) || (mes == 10 && dia <= 22)) { signo = "Libra"; significado = "Busca por equilíbrio, diplomacia, estética e harmonia nas relações."; }
    else if ((mes == 10 && dia >= 23) || (mes == 11 && dia <= 21)) { signo = "Escorpião"; significado = "Profundidade emocional, transformação, intensidade e clareza oculta."; }
    else if ((mes == 11 && dia >= 22) || (mes == 12 && dia <= 21)) { signo = "Sagitário"; significado = "Expansão, otimismo, busca por novos horizontes e aprendizados."; }
    else if ((mes == 12 && dia >= 22) || (mes == 1 && dia <= 19)) { signo = "Capricórnio"; significado = "Responsabilidade, foco em metas de longo prazo, disciplina e estrutura."; }
    else if ((mes == 1 && dia >= 20) || (mes == 2 && dia <= 18)) { signo = "Aquário"; significado = "Inovação, visão de futuro, originalidade e coletividade."; }
    
    setTextoSeExistir("astro-valor", "Sol em " + signo);
    setTextoSeExistir("astro-significado", significado);
}

function calcularFaseLua(data) {
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    let m = mes, a = ano;
    if (m < 3) { a--; m += 12; }
    m++;
    let c = 365.25 * a, e = 30.6 * m;
    let jd = c + e + dia - 694039.09;
    jd /= 29.53058867;
    let b_val = parseInt(jd);
    jd -= b_val;
    let idadeDias = jd * 29.53;
    let fase = "Lua Crescente", significado = "Fase voltada ao desenvolvimento, plantio de ideias e crescimento.";
    
    if (idadeDias < 1.84) { fase = "Lua Nova"; significado = "Momento excelente para intenções, recomeços e plantio de sementes."; }
    else if (idadeDias < 9.22) { fase = "Lua Crescente"; significado = "Impulso para dar andamento a projetos e fortalecer alicerces."; }
    else if (idadeDias < 18.45) { fase = "Lua Cheia"; significado = "Apogeu energético, intuição expandida, clareza e forte iluminação emocional."; }
    else if (idadeDias < 27.68) { fase = "Lua Minguante"; significado = "Período ideal para limpezas, encerramentos e desapegos."; }
    
    setTextoSeExistir("lua-valor", fase);
    setTextoSeExistir("lua-significado", significado);
}

function calcularNumerologia(data) {
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    
    const somaNumeros = ("" + dia + mes + ano).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    
    const reduzirUnidade = (n) => {
        while (n > 9) {
            n = String(n).split('').reduce((a, c) => a + parseInt(c), 0);
        }
        return n;
    };

    const numeroDia = reduzirUnidade(somaNumeros);
    
    const significadosNumerologia = {
        1: "Dia de novos começos, iniciativa e liderança pessoal.",
        2: "Momento de cooperação, diplomacia, paciência e parcerias.",
        3: "Foco na comunicação, expressão criativa, alegria e expansão.",
        4: "Construção sólida, organização, foco no trabalho e estabilidade.",
        5: "Energia de mudanças, versatilidade, liberdade e novas experiências.",
        6: "Harmonia familiar, cuidado com o lar, responsabilidade e afeto.",
        7: "Intuição acentuada, estudo, introspecção e busca espiritual.",
        8: "Poder pessoal, foco em realizações materiais, justiça e finanças.",
        9: "Conclusão de ciclos, generosidade, compaixão e desapego."
    };

    setTextoSeExistir("num-valor", "Vibração " + numeroDia);
    setTextoSeExistir("num-significado", significadosNumerologia[numeroDia] || "Dia de energias equilibradas.");
}

function inicializarAstrologiaLua() {
    const hoje = new Date();
    
    const opcoesData = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const elData = document.getElementById("data-hoje");
    if (elData) {
        elData.innerText = "Data de referência: " + hoje.toLocaleDateString('pt-BR', opcoesData);
    }

    calcularNumerologia(hoje);
    calcularFaseLua(hoje);
    calcularSignoSolar(hoje);
}