const apiUrlClientes = 'http://localhost:5000/clientes';
const apiUrlLivros = 'http://localhost:5000/livros';

const formCliente = document.getElementById('form-cliente');
const containerClientes = document.getElementById('container-clientes');
const containerSelectsLivro = document.getElementById('container-selects-livro');
const btnAddLivro = document.getElementById('btn-add-livro');
const formTitulo = document.getElementById('form-titulo');
const formBotaoSubmit = document.querySelector('#form-cliente button[type="submit"]');
const btnCancelar = document.getElementById('btn-cancelar');
const cpfInput = document.getElementById('cpf');

let modoEdicao = false;
let cpfEmEdicao = null;


function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) {
        return false;
    }
    return true; 
}


function atualizarOpcoesLivros() {
    const todosSelects = containerSelectsLivro.querySelectorAll('select');
    const livrosSelecionados = new Set();
    
   
    todosSelects.forEach(select => {
        if (select.value) {
            livrosSelecionados.add(select.value);
        }
    });

   
    todosSelects.forEach(selectAtual => {
        const valorAtual = selectAtual.value;
        const opcoes = selectAtual.querySelectorAll('option');
        
        opcoes.forEach(option => {
            const livroId = option.value;
            if (livroId && livrosSelecionados.has(livroId) && livroId !== valorAtual) {
                option.disabled = true;
                option.style.display = 'none';
            } else {
                option.disabled = false;
                option.style.display = 'block';
            }
        });
    });
}


cpfInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    if (value.length > 0) formattedValue += value.substring(0, 3);
    if (value.length > 3) formattedValue += '.' + value.substring(3, 6);
    if (value.length > 6) formattedValue += '.' + value.substring(6, 9);
    if (value.length > 9) formattedValue += '-' + value.substring(9, 11);
    e.target.value = formattedValue;
});

function carregarClientes() {
    fetch(apiUrlClientes, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            containerClientes.innerHTML = '';
            const lista = Array.isArray(data) ? data : (data && (data.clientes || data.dados)) || [];
            if (!lista || lista.length === 0) {
                containerClientes.innerHTML = '<div class="alert alert-light text-center">Nenhum cliente encontrado.</div>';
                return;
            }

            lista.forEach(cliente => {
                const cardColuna = document.createElement('div');
                cardColuna.className = 'col-12';
                cardColuna.innerHTML = `
                    <div class="card shadow-sm mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <div class="row align-items-center">
                                        <div class="col-md-6">
                                            <h5 class="card-title fw-bold mb-1">${cliente.cli_nome}</h5>
                                            <p class="card-text text-muted mb-0"><small>CPF: ${cliente.cli_cpf}</small></p>
                                        </div>
                                        <div class="col-md-6">
                                            <p class="card-text mb-1"><i class="fas fa-envelope me-2 text-muted"></i>${cliente.cli_email}</p>
                                            <p class="card-text mb-0"><i class="fas fa-phone me-2 text-muted"></i>${cliente.cli_telefone || 'Não informado'}</p>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <strong>Livros associados:</strong>
                                        <ul id="livros-cliente-${cliente.cli_cpf}">
                                            <li>Carregando...</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="ms-4">
                                    <button class="btn btn-sm btn-warning w-100 mb-2 btn-editar" data-cpf="${cliente.cli_cpf}">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger w-100 btn-excluir" data-cpf="${cliente.cli_cpf}" data-nome="${cliente.cli_nome}">
                                        <i class="fas fa-trash-alt"></i> Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                containerClientes.appendChild(cardColuna);
                carregarLivrosDoCliente(cliente.cli_cpf);
            });
        })
        .catch(() => {
            containerClientes.innerHTML = '<div class="alert alert-danger">❌ Erro ao carregar clientes.</div>';
        });
}


function carregarLivrosDoCliente(cpf) {
    fetch(`${apiUrlClientes}/${cpf}/livros`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            const ul = document.getElementById(`livros-cliente-${cpf}`);
            ul.innerHTML = '';
            const lista = data.livros || [];
            if (lista.length === 0) {
                ul.innerHTML = '<li>Nenhum livro associado</li>';
                return;
            }
            lista.forEach(livro => {
                const li = document.createElement('li');
                li.textContent = `${livro.liv_titulo} (Autor: ${livro.liv_autor})`;
                ul.appendChild(li);
            });
        })
        .catch(() => {
            const ul = document.getElementById(`livros-cliente-${cpf}`);
            ul.innerHTML = '<li>Erro ao carregar livros</li>';
        });
}


async function carregarLivrosDisponiveis() {
    try {
        const res = await fetch(`${apiUrlLivros}?status=disponivel`, { cache: 'no-store' });
        const data = await res.json();
        return Array.isArray(data) ? data : (data && (data.livros || data.dados)) || [];
    } catch {
        console.error('Erro ao carregar livros disponíveis.');
        return [];
    }
}


async function criarSelectLivro(livroSelecionado = '') {
    const livros = await carregarLivrosDisponiveis();
    const div = document.createElement('div');
    div.className = 'mb-2 d-flex gap-2';

    const select = document.createElement('select');
    select.className = 'form-select form-select-sm';
    select.innerHTML = '<option value="">Nenhum livro selecionado</option>';
    livros.forEach(l => {
        const option = document.createElement('option');
        option.value = l.liv_id;
        option.textContent = `${l.liv_titulo} (Autor: ${l.liv_autor})`;
        if (l.liv_id == livroSelecionado) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener('change', atualizarOpcoesLivros);

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn btn-danger btn-sm';
    btnRemove.textContent = '-';
    btnRemove.addEventListener('click', () => {
        div.remove();
        atualizarOpcoesLivros();
    });

    div.appendChild(select);
    div.appendChild(btnRemove);
    containerSelectsLivro.appendChild(div);

    atualizarOpcoesLivros();
}


function inicializarSelectLivro() {
    containerSelectsLivro.innerHTML = '';
    criarSelectLivro();
}


async function handleFormSubmit(event) {
    event.preventDefault();

    const dadosCliente = {
        cli_nome: document.getElementById('nome').value,
        cli_telefone: document.getElementById('telefone').value,
        cli_email: document.getElementById('email').value
    };

    if (!modoEdicao && !validarCPF(cpfInput.value)) {
        alert('❌ Por favor, insira um CPF válido com 11 dígitos.');
        cpfInput.focus();
        return;
    }

    const selects = containerSelectsLivro.querySelectorAll('select');
    const liv_ids = Array.from(selects).map(s => s.value).filter(v => v);
    if (liv_ids.length) dadosCliente.liv_ids = liv_ids;

    if (modoEdicao) {
        fetch(`${apiUrlClientes}/${cpfEmEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCliente)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                resetarFormulario();
                carregarClientes();
                setTimeout(() => alert(`✅ Cliente "${dadosCliente.cli_nome}" atualizado com sucesso!`), 100);
            } else {
                alert(`❌ Erro ao atualizar cliente: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao atualizar cliente. Verifique o console.'));
    } else {
        dadosCliente.cli_cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        fetch(apiUrlClientes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCliente)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                resetarFormulario();
                carregarClientes();
                setTimeout(() => alert(`✅ Cliente "${dadosCliente.cli_nome}" cadastrado com sucesso!`), 100);
            } else {
                alert(`❌ Erro ao cadastrar cliente: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao cadastrar cliente. Verifique o console.'));
    }
}


function excluirCliente(cpf, nome) {
    fetch(`${apiUrlClientes}/${cpf}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(`🗑️ Cliente "${nome}" foi removido com sucesso!`);
                carregarClientes();
            } else {
                alert(`❌ Erro ao remover cliente: ${data.message || 'Tente novamente.'}`);
            }
        })
        .catch(() => alert('❌ Erro ao excluir cliente. Verifique o console.'));
}


async function iniciarEdicao(cliente) {
    modoEdicao = true;
    cpfEmEdicao = cliente.cli_cpf;

    document.getElementById('cpf').value = cliente.cli_cpf;
    document.getElementById('cpf').disabled = true;
    document.getElementById('nome').value = cliente.cli_nome;
    document.getElementById('telefone').value = cliente.cli_telefone;
    document.getElementById('email').value = cliente.cli_email;

    formTitulo.textContent = '✏️ Editando Cliente';
    formBotaoSubmit.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar';
    btnCancelar.style.display = 'inline-block';

    containerSelectsLivro.innerHTML = '';
    const res = await fetch(`${apiUrlClientes}/${cliente.cli_cpf}`, { cache: 'no-store' });
    const data = await res.json();
    const clienteCompleto = data.clientes && data.clientes[0] ? data.clientes[0] : null;

    if (clienteCompleto && clienteCompleto.livros && clienteCompleto.livros.length) {
        for (const l of clienteCompleto.livros) {
            await criarSelectLivro(l.liv_id);
        }
    } else {
        await criarSelectLivro();
    }
    
    atualizarOpcoesLivros();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function resetarFormulario() {
    formCliente.reset();
    modoEdicao = false;
    cpfEmEdicao = null;
    document.getElementById('cpf').disabled = false;
    formTitulo.textContent = 'Cadastrar Novo Cliente';
    formBotaoSubmit.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Cliente';
    btnCancelar.style.display = 'none';
    inicializarSelectLivro();
}


containerClientes.addEventListener('click', event => {
    const botaoExcluir = event.target.closest('.btn-excluir');
    const botaoEditar = event.target.closest('.btn-editar');

    if (botaoExcluir) {
        const cpf = botaoExcluir.dataset.cpf;
        const nome = botaoExcluir.dataset.nome;
        if (confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
            excluirCliente(cpf, nome);
        }
    } else if (botaoEditar) {
        const cpf = botaoEditar.dataset.cpf;
        fetch(`${apiUrlClientes}/${cpf}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                const cliente = (data && data.clientes && data.clientes[0]) || (Array.isArray(data) && data[0]);
                if (cliente) iniciarEdicao(cliente);
                else alert('❌ Cliente não encontrado para edição.');
            })
            .catch(() => alert('❌ Erro ao buscar cliente para edição.'));
    }
});


btnAddLivro.addEventListener('click', () => criarSelectLivro());


btnCancelar.addEventListener('click', resetarFormulario);


formCliente.addEventListener('submit', handleFormSubmit);


document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    inicializarSelectLivro();
});