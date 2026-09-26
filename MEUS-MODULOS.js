   <div id="menu-container"></div>
<script>
    fetch('modulos/menu-index.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('menu-container').innerHTML = html;
    })
    .catch(error => {
        console.error('Erro ao carregar o menu:', error);
    });
lucide.createIcons();
</script>

   
   
   <div id="ads-container-1"></div>
<script>
    fetch('modulos/ads-1.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('ads-container-1').innerHTML = html;
    })
    .catch(error => {
        console.error('Erro ao carregar o anúncio:', error);
    });
    </script>

