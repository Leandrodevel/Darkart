// app.js

document.addEventListener("DOMContentLoaded", async () => {
    // 1. CARREGAMENTO DOS DADOS DO BANCO (INDEX)
    try {
        const resultado = await buscarDadosDoBanco();
        
        if (!resultado || !resultado.dados) {
            throw new Error("Dados não encontrados.");
        }

        const r = resultado.dados.resumoDiario;
        const video = resultado.dados.videoDoDia;

        // Preenche a data de referência
        const elData = document.getElementById("data-hoje");
        if (elData) elData.innerText = `Data de referência: ${r.data}`;

        // Preenchendo os cards do dia
        setTextoSeExistir("num-valor", `Número ${r.numero.valor}`);
        setTextoSeExistir("num-significado", r.numero.significado);

        setTextoSeExistir("lua-valor", r.lua.fase);
        setTextoSeExistir("lua-significado", r.lua.significado);

        setTextoSeExistir("cor-valor", r.cor.nome);
        setTextoSeExistir("cor-significado", r.cor.significado);

        setTextoSeExistir("astro-valor", r.astrologia.valor);
        setTextoSeExistir("astro-significado", r.astrologia.significado);

        setTextoSeExistir("arcano-valor", r.arcano.nome);
        setTextoSeExistir("arcano-significado", r.arcano.significado);

        setTextoSeExistir("cristal-valor", r.cristal.nome);
        setTextoSeExistir("cristal-significado", r.cristal.significado);

        setTextoSeExistir("runa-valor", r.runa.nome);
        setTextoSeExistir("runa-significado", r.runa.significado);

        setTextoSeExistir("santo-valor", r.santo.nome);
        setTextoSeExistir("santo-significado", r.santo.significado);

        setTextoSeExistir("video-titulo", video.titulo);
        setTextoSeExistir("video-descricao", video.descricao);

        // Iframe do YouTube
        const iframeVideo = document.getElementById("video-iframe");
        if (iframeVideo && video.youtubeId) {
            iframeVideo.src = `https://www.youtube.com/embed/${video.youtubeId}`;
        }

    } catch (error) {
        console.warn("Aviso: Alguns elementos de dados não foram encontrados nesta página específica.", error);
    }

    // 2. CONTROLE DO MENU HAMBÚRGUER (GLOBAL PARA AS PÁGINAS)
    const btnMenu = document.getElementById("btn-menu");
    const dropdownMenu = document.getElementById("dropdown-menu");

    if (btnMenu && dropdownMenu) {
        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("opacity-0");
            dropdownMenu.classList.toggle("invisible");
            dropdownMenu.classList.toggle("-translate-y-2");
        });

        // Fecha o menu ao clicar fora dele
        document.addEventListener("click", (e) => {
            if (!dropdownMenu.contains(e.target) && !btnMenu.contains(e.target)) {
                dropdownMenu.classList.add("opacity-0", "invisible", "-translate-y-2");
            }
        });
    }
});

// Função auxiliar para evitar erros caso algum ID opcional não exista no HTML
function setTextoSeExistir(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.innerText = texto;
    }
}

// 3. FUNÇÃO DE SELEÇÃO DE SIGNOS (Global)
function selectSign(signoKey) {
    if (typeof signosData === 'undefined') return;
    const dados = signosData[signoKey];
    if (!dados) return;

    // Atualiza os elementos na tela com base na seleção
    const nameEl = document.getElementById("sign-name");
    const elementEl = document.getElementById("sign-element");
    const datesEl = document.getElementById("sign-dates");
    const essenceEl = document.getElementById("sign-essence");
    const shadowEl = document.getElementById("sign-shadow");

    if (nameEl) nameEl.textContent = dados.nome;
    if (elementEl) elementEl.textContent = dados.elemento;
    if (datesEl) datesEl.textContent = dados.datas;
    if (essenceEl) essenceEl.textContent = dados.essencia;
    if (shadowEl) shadowEl.textContent = dados.sombra;

    // Efeito visual nos botões (destaca o selecionado)
    document.querySelectorAll(".sign-btn").forEach(btn => {
        btn.classList.remove("border-emerald-600", "bg-emerald-50/80");
    });
    
    const activeBtn = document.getElementById(`sign-btn-${signoKey}`);
    if (activeBtn) {
        activeBtn.classList.add("border-emerald-600", "bg-emerald-50/80");
    }
}
