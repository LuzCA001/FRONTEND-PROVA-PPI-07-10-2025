const apiUrlLivros = 'http://localhost:5000/livros';

const formLivro = document.getElementById('form-livro');
const containerLivros = document.getElementById('container-livros');
const formTituloLivro = document.getElementById('form-titulo-livro');
const btnCancelarLivro = document.getElementById('btn-cancelar-livro');
const btnSalvarLivro = formLivro.querySelector('button[type="submit"]');

let modoEdicao = false;
let idEmEdicao = null;


function carregarLivros() {
    fetch(apiUrlLivros, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            containerLivros.innerHTML = '';
            const lista = Array.isArray(data) ? data : (data && (data.livros || data.dados)) || [];

            if (!lista || lista.length === 0) {
                containerLivros.innerHTML = '<div class="alert alert-light text-center">Nenhum livro encontrado.</div>';
                return;
            }

            lista.forEach(livro => {
                const cardColuna = document.createElement('div');
                cardColuna.className = 'col-12';
                cardColuna.innerHTML = `
                    <div class="card shadow-sm mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-grow-1">
                                    <h5 class="card-title fw-bold mb-1">${livro.liv_titulo}</h5>
                                    <p class="card-text mb-1">Autor: ${livro.liv_autor}</p>
                                    <p class="card-text mb-0">Cliente Associado: ${livro.cli_cpf || '<span class="badge bg-success">Disponível</span>'}</p>
                                </div>
                                <div class="ms-4">
                                    <button class="btn btn-sm btn-warning w-100 mb-2 btn-editar" data-id="${livro.liv_id}">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger w-100 btn-excluir" data-id="${livro.liv_id}" data-titulo="${livro.liv_titulo}">
                                        <i class="fas fa-trash-alt"></i> Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                containerLivros.appendChild(cardColuna);
            });
        })
        .catch(() => {
            containerLivros.innerHTML = '<div class="alert alert-danger">❌ Erro ao carregar livros.</div>';
        });
}


function handleFormSubmit(event) {
    event.preventDefault();

    const dadosLivro = {
        liv_titulo: document.getElementById('liv_titulo').value,
        liv_autor: document.getElementById('liv_autor').value
    };

    if (modoEdicao) {
       
        fetch(`${apiUrlLivros}/${idEmEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLivro)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                resetarFormulario();
                carregarLivros();
                setTimeout(() => alert(`✅ Livro "${dadosLivro.liv_titulo}" atualizado com sucesso!`), 100);
            } else {
                alert(`❌ Erro ao atualizar livro: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao atualizar livro. Verifique o console.'));
    } else {
       
        fetch(apiUrlLivros, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLivro)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                resetarFormulario();
                carregarLivros();
                setTimeout(() => alert(`✅ Livro "${dadosLivro.liv_titulo}" cadastrado com sucesso!`), 100);
            } else {
                alert(`❌ Erro ao cadastrar livro: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao cadastrar livro. Verifique o console.'));
    }
}


function excluirLivro(id, titulo) {
    fetch(`${apiUrlLivros}/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(`🗑️ Livro "${titulo}" removido com sucesso!`);
                carregarLivros();
            } else {
                alert(`❌ Erro ao remover livro: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao excluir livro. Verifique o console.'));
}


function iniciarEdicao(livro) {
    modoEdicao = true;
    idEmEdicao = livro.liv_id;

    document.getElementById('liv_titulo').value = livro.liv_titulo;
    document.getElementById('liv_autor').value = livro.liv_autor;

    formTituloLivro.textContent = '✏️ Editando Livro';
    btnSalvarLivro.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar';
    btnCancelarLivro.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function resetarFormulario() {
    formLivro.reset();
    modoEdicao = false;
    idEmEdicao = null;
    formTituloLivro.textContent = 'Cadastrar Novo Livro';
    btnSalvarLivro.innerHTML = '<i class="fas fa-book me-2"></i>Salvar Livro';
    btnCancelarLivro.style.display = 'none';
}


containerLivros.addEventListener('click', event => {
    const botaoExcluir = event.target.closest('.btn-excluir');
    const botaoEditar = event.target.closest('.btn-editar');

    if (botaoExcluir) {
        const id = botaoExcluir.dataset.id;
        const titulo = botaoExcluir.dataset.titulo;
        if (confirm(`Tem certeza que deseja excluir o livro "${titulo}"?`)) {
            excluirLivro(id, titulo);
        }
    } else if (botaoEditar) {
        const id = botaoEditar.dataset.id;
        fetch(`${apiUrlLivros}/${id}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                const livro = (data && data.livros && data.livros[0]) || (Array.isArray(data) && data[0]);
                if (livro) iniciarEdicao(livro);
                else alert('❌ Livro não encontrado para edição.');
            })
            .catch(() => alert('❌ Erro ao buscar livro para edição.'));
    }
});

// 🧩 Eventos
btnCancelarLivro.addEventListener('click', resetarFormulario);
formLivro.addEventListener('submit', handleFormSubmit);
document.addEventListener('DOMContentLoaded', carregarLivros);
