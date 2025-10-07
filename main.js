function carregarComponente(url, elementoId) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementoId).innerHTML = data;
        });
}


document.addEventListener('DOMContentLoaded', function() {
    carregarComponente('navbar.html', 'navbar-container');
});