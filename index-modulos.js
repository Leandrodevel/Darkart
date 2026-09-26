fetch('modulos/menu-index.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('menu-container').innerHTML = html;
    })
    .catch(error => {
        console.error('Erro ao carregar o menu:', error);
    });