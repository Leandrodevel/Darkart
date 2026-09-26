//modulo do menu principal
fetch('modulos/menu-index.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('menu-container').innerHTML = html;
    })
    .catch(error => {
        console.error('Erro ao carregar o menu:', error);
    });

    //modulo do ADS 1

    fetch('modulos/ads-1.html')
    .then(response => response.text())
    .then(html => { 
        document.getElementById('ads-container-1').innerHTML = html;
    })
    .catch(error => {
        console.error('Erro ao carregar o anúncio 1:', error);
    });

    