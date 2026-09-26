   const link = "https://apretailer.com.br/click/6ab1f6522bfa81657d75da73/360567/subaccount/url=https%3A%2F%2Fwww.drogariaspacheco.com.br%2Fmelatonina-menta-melatonum-max-30ml-solucao-gotas%2Fp%3F_gl%3D1%2A10cr0u6%2A_up%2AMQ..%2A_gs%2AMQ..%26gclid%3DCj0KCQjwt9jVBhDXARIsAFSP-6c_agwjQb0qSAJWWwD6WaT5_uDqJlkX_SwWoSEB87inJbmOynd7FWwaAoe9EALw_wcB%26gbraid%3D0AAAAADnsPzMv8uJbD3hvHuDTWq15h5k07";
    const imagem_produto = "../img/melatonina-wide.jpg";
    const titulo_produto = "Melatonum Max 30ml - Melatonina em Gotas Sabor Menta";
    const descricao_produto = "Clique na imagem para aproveitar o desconto";
    const patrocinador = "Drogarias Pacheco";

    // Atribuição correta aos elementos do DOM
    document.getElementById("ad_link").href = link;
    document.getElementById("ad2_link").href = link; // Adicionado para o título também funcionar como link
    document.getElementById("ad_image").src = imagem_produto;
    document.getElementById("ad_image").alt = titulo_produto;
    document.getElementById("ad_patrocinador").textContent = patrocinador;
    document.getElementById("ad2_link").textContent = titulo_produto;
    document.getElementById("ad_descricao").textContent = descricao_produto;