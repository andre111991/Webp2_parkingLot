const API_BASE_URL = "http://localhost:3000";

function obterHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

// ==========================================
// 🚗 FUNÇÕES DA GARAGEM (GLOBAIS)
// ==========================================
async function carregarVeiculosGaragem() {
    const lista = document.getElementById("lista-veiculos");
    if (!lista) return;

    try {
        console.log("🔄 A carregar veículos para a interface da Garagem...");
        const resposta = await fetch(`${API_BASE_URL}/veiculos/meu`, {
            method: "GET",
            headers: obterHeaders()
        });

        if (resposta.ok) {
            const veiculos = await resposta.json();
            console.log("🚗 Veículos obtidos para a Garagem:", veiculos);
            
            if (veiculos.length === 0) {
                lista.innerHTML = `<p class="texto-vazio" style="margin:0; color:#666;">A tua garagem está vazia. Adiciona o teu primeiro veículo!</p>`;
                return;
            }

            let htmlGeral = `<div style="display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto;">`;
            veiculos.forEach(v => {
                const badgeCombustivel = v.tipo_combustivel === "eletrico" ? "⚡ Elétrico" : "⛽ Combustão";
                
                htmlGeral += `
                    <div class="item-veiculo" style="padding: 12px; background-color: #f4f6f2; border-left: 4px solid #5b6b47; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <strong style="color: #222; font-size: 15px; letter-spacing: 1px;">${v.matricula.toUpperCase()}</strong>
                            <span style="font-size: 11px; align-self: flex-start; background: #e2e8f0; padding: 2px 8px; border-radius: 12px; color: #444; font-weight: 500;">${badgeCombustivel}</span>
                        </div>
                        
                        <button class="btn-delete-veiculo" 
                                style="border: 1px solid #bd4b4b; color: #bd4b4b; background: white; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s;"
                                onclick="eliminarVeiculo(${v.id_veiculo})">
                            Apagar
                        </button>
                    </div>
                `;
            });
            htmlGeral += `</div>`;
            lista.innerHTML = htmlGeral;
        } else {
            lista.innerHTML = `<p class="texto-vazio" style="color: red;">Erro ao carregar veículos (${resposta.status}).</p>`;
        }
    } catch (err) {
        console.error("Erro na Garagem:", err);
        lista.innerHTML = `<p class="texto-vazio" style="color: red;">Erro de ligação ao servidor.</p>`;
    }
}

async function eliminarVeiculo(idVeiculo) {
    if (!idVeiculo) {
        alert("Erro: ID do veículo inválido.");
        return;
    }

    if (!confirm("Tens a certeza que desejas remover este veículo da tua garagem?")) {
        return;
    }

    try {
        console.log(`📡 A enviar pedido DELETE para apagar o veículo ID: ${idVeiculo}...`);
        
        // Faz o pedido DELETE para a rota base de veículos passando o ID
        const resposta = await fetch(`${API_BASE_URL}/veiculos/${idVeiculo}`, {
            method: "DELETE",
            headers: obterHeaders() // Já inclui o teu Token de Autorização
        });

        if (resposta.ok) {
            alert("Veículo removido com sucesso!");
            
            // 🔄 Atualiza a garagem e os seletores no ecrã automaticamente!
            await carregarVeiculosGaragem();
            
            if (document.getElementById('reserva-veiculo') && typeof carregarVeiculosParaReserva === "function") {
                await carregarVeiculosParaReserva();
            }
        } else {
            const erroDetalhado = await resposta.json().catch(() => ({}));
            alert("Erro do Servidor: " + (erroDetalhado.message || "Não foi possível remover o veículo."));
        }
    } catch (err) {
        console.error("❌ Erro ao apagar veículo:", err);
        alert("Falha de comunicação com o servidor.");
    }
}

async function carregarVeiculosParaReserva() {
    const selectElement = document.getElementById('reserva-veiculo');
    if (!selectElement) return;

    try {
        console.log("🔄 A carregar veículos para o seletor de reservas...");
        const resposta = await fetch(`${API_BASE_URL}/veiculos/meu`, {
            method: "GET",
            headers: obterHeaders()
        });

        if (resposta.ok) {
            const veiculos = await resposta.json();
            console.log("🚗 Veículos obtidos para as Reservas:", veiculos);

            if (!veiculos || veiculos.length === 0) {
                selectElement.innerHTML = '<option value="">Nenhum veículo na garagem</option>';
                return;
            }

            selectElement.innerHTML = '<option value="">Escolhe um veículo</option>';
            
            veiculos.forEach(v => {
                if (v.matricula) {
                    const matriculaFormatada = v.matricula.toUpperCase();
                    const tipoCombustivel = v.tipo_combustivel === "eletrico" ? "⚡ Elétrico" : "⛽ Combustão";
                    
                    const option = document.createElement('option');
option.value = v.id_veiculo; // 🔥 CRUCIAL: O value guarda o ID numérico!
option.textContent = `${v.matricula} (🚗 ${v.tipo_combustivel})`; // O que o utilizador lê
selectElement.appendChild(option);
                }
            });
            console.log("✅ Dropdown de veículos de reserva preenchido!");
        } else {
            selectElement.innerHTML = `<option value="">Erro do servidor (${resposta.status})</option>`;
        }
    } catch (err) {
        console.error("Falha no Fetch das reservas:", err);
        selectElement.innerHTML = '<option value="">Erro crítico de ligação</option>';
    }
}


// ==========================================
// ⚡ EVENTO PRINCIPAL DOMContentLoaded
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // Injetar o menu dinamicamente logo no início
    injetarMenu(); 

    // --- 1. FORMULÁRIO DE REGISTO ---
    const formRegisto = document.getElementById('formRegisto'); 
    if (formRegisto) {
        formRegisto.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const password = document.getElementById('reg-pass').value;
            const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!regexPassword.test(password)) {
                alert("A password deve conter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.");
                return;
            }

            const dadosFormulario = {
                name: document.getElementById('reg-nome').value,
                email: document.getElementById('reg-email').value,
                password: password
            };

            try {
                const resposta = await fetch(`${API_BASE_URL}/utilizadores/registo`, {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosFormulario)
                });

                if (!resposta.ok) {
                    const err = await resposta.json();
                    throw new Error(err.message || "Erro no registo.");
                }
                
                alert("Registo feito com sucesso!");
                window.location.href = "login.html"; 
            } catch (erro) { alert(erro.message); }
        });
    }

    // --- 2. FORMULÁRIO DE LOGIN ---
   // --- 2. FORMULÁRIO DE LOGIN ---
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dadosLogin = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-pass').value
            };

            try {
                const res = await fetch(`${API_BASE_URL}/utilizadores/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLogin)
                });

                if (!res.ok) throw new Error("Credenciais inválidas");
                
                const data = await res.json();
                
                // 1. Guarda o Token e o Email que veio da Base de Dados
                if (data.token) localStorage.setItem("token", data.token);
                
                // IMPORTANTE: Ajustar caso o teu backend devolva 'data.email' ou 'data.user.email'
                const emailUtilizador = data.email || dadosLogin.email; 
                localStorage.setItem("userEmail", emailUtilizador.toLowerCase());
                
                alert("Login efetuado com sucesso!");
                
                // 2. O DESVIO INTELIGENTE: Verifica se é o admin
                const EMAIL_ADMIN_CORRETO = "admin1@admin.com"; 
                
                if (emailUtilizador.toLowerCase() === EMAIL_ADMIN_CORRETO.toLowerCase()) {
                    window.location.href = "admin.html"; // Admin vai para o painel de controlo
                } else {
                    window.location.href = "index.html"; // Clientes normais vão para o site
                }

            } catch (err) {
                console.error(err);
                alert("Erro no login: Verifica os teus dados.");
            }
        });
    }

    // --- 3. PROTEÇÃO DE ROTAS E INICIALIZAÇÃO ---
    const paginaAtual = window.location.pathname;
   // Procura esta linha no teu script.js e adiciona o "admin.html"
if (!paginaAtual.includes("login.html") && !paginaAtual.includes("registar.html") && !paginaAtual.includes("admin.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    inicializarApp();
    setupEventosInterface();
}

    // --- 4. LÓGICA DA PÁGINA DE RESERVAS ---
    const selectVeiculo = document.getElementById('reserva-veiculo');
    if (selectVeiculo) {
        carregarVeiculosParaReserva();
    }

    // FIX: Variável capturada corretamente para evitar quebras de execução no JS!
   // --- 4. LÓGICA DA PÁGINA DE RESERVAS ---
    // --- 4. LÓGICA DA PÁGINA DE RESERVAS ---
  // --- 4. LÓGICA DA PÁGINA DE RESERVAS ---
    // --- 4. LÓGICA DA PÁGINA DE RESERVAS ---
    const btnEfetuarReserva = document.querySelector('.btn-efetuar-reserva');
    if (btnEfetuarReserva) {
        btnEfetuarReserva.addEventListener('click', async () => {
            // 1. Captura os valores diretamente do ecrã
            const idVeiculoEscolhido = document.getElementById('reserva-veiculo').value; // Agora traz o ID diretamente!
            const dataInicio = document.getElementById('reserva-data-inicio').value;
            const dataFim = document.getElementById('reserva-data-fim').value;
            const tipoVagaEscolhido = document.getElementById('reserva-tipo-vaga').value;

            if (!idVeiculoEscolhido || !dataInicio || !dataFim || !tipoVagaEscolhido) {
                alert("Por favor, preenche todos os campos antes de efetuar a reserva!");
                return;
            }

            try {
                // 2. Mapeamento do tipo de vaga para a Base de Dados
                let tipoVagaBD = "combustao"; 
                if (tipoVagaEscolhido.toLowerCase().includes("elét") || tipoVagaEscolhido.toLowerCase() === "eletrico") {
                    tipoVagaBD = "eletrico";
                }

                console.log(`🔍 A procurar uma vaga livre do tipo: [${tipoVagaBD}]`);
                
                // 3. Procurar uma vaga livre correspondente na API
                const resVagas = await fetch(`${API_BASE_URL}/vagas`, { headers: obterHeaders() });
                if (!resVagas.ok) throw new Error("Não foi possível consultar as vagas.");
                
                const listaVagas = await resVagas.json();
                const vagaLivreCorrespondente = listaVagas.find(v => 
                    Number(v.estado) === 0 && 
                    v.tipo.toLowerCase() === tipoVagaBD
                );

                if (!vagaLivreCorrespondente) {
                    alert(`Infelizmente, já não existem vagas livres do tipo [${tipoVagaEscolhido}] no parque!`);
                    return;
                }

                // 4. Construir o objeto perfeito para o teu middleware validarReservaInput
                const dadosReserva = {
                    id_veiculo: parseInt(idVeiculoEscolhido), // Número puro e limpo!
                    id_vaga: parseInt(vagaLivreCorrespondente.id_vaga),
                    data_hora_inicio: dataInicio,
                    data_hora_fim: dataFim
                };

                console.log("📡 A enviar dados para gravação real:", dadosReserva);

                // 5. POST real para a rota das reservas
                const respostaServidor = await fetch(`${API_BASE_URL}/reservas`, {
                    method: "POST",
                    headers: obterHeaders(),
                    body: JSON.stringify(dadosReserva)
                });

                if (respostaServidor.ok) {
                    alert("Reserva efetuada com sucesso!");
                    window.location.href = "vagas.html"; // Redireciona e atualiza os contadores reais
                } else {
                    const erroResposta = await respostaServidor.json().catch(() => ({}));
                    alert("Erro do Servidor: " + (erroResposta.message || "Verifica os dados introduzidos."));
                }

            } catch (err) {
                console.error("❌ Erro crítico no processo de reserva:", err);
                alert("Falha de comunicação com o servidor.");
            }
        });
    }
    
    // --- 5. SUBMISSAO DO FORMULÁRIO DE ADICIONAR VEÍCULO ---
    // Monitoriza o envio do formulário em vez do clique solto no botão para capturar o Enter também
    const formAddVeiculo = document.getElementById("form-add-veiculo");
    if (formAddVeiculo) {
        formAddVeiculo.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("🚀 Evento submit ativado no formulário do veículo!");

            const inputMatricula = document.getElementById("input-matricula");
            const switchVe = document.getElementById("switch-ve");

            if (!inputMatricula) {
                alert("Erro: Campo de matrícula não encontrado no HTML.");
                return;
            }

            const matriculaValor = inputMatricula.value.trim();
            const isEletrico = switchVe ? switchVe.checked : false;

            const novoVeiculo = {
                matricula: matriculaValor,
                tipo_combustivel: isEletrico ? "eletrico" : "combustao"
            };

            try {
                console.log("📡 A enviar dados para o backend...", novoVeiculo);
                const resposta = await fetch(`${API_BASE_URL}/veiculos`, {
                    method: "POST",
                    headers: obterHeaders(),
                    body: JSON.stringify(novoVeiculo)
                });

                if (resposta.ok) {
                    alert("Veículo adicionado com sucesso!");
                    
                    // Fechar o popup de forma limpa
                    const overlayAdd = document.getElementById("overlay-add-veiculo");
                    if (overlayAdd) overlayAdd.style.display = "none";
                    
                    // Limpar formulário
                    formAddVeiculo.reset();
                    
                    // Atualizar componentes ativos no ecrã automaticamente
                    await carregarVeiculosGaragem();
                    if (document.getElementById('reserva-veiculo')) {
                        await carregarVeiculosParaReserva();
                    }
                } else {
                    const erroDetalhado = await resposta.json().catch(() => ({}));
                    alert("Erro do Servidor: " + (erroDetalhado.message || "Verifica os dados inseridos."));
                }
            } catch (err) {
                console.error("Erro no Fetch:", err);
                alert("Não foi possível ligar ao servidor. Garante que a API está a correr!");
            }
        });
    }
});

// ==========================================
// 🌟 FUNÇÕES AUXILIARES E DE INTERFACE
// ==========================================
async function inicializarApp() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/utilizadores/me`, {
            method: "GET",
            headers: obterHeaders()
        });
        if (resposta.ok) {
            const user = await resposta.json();
            const nomeUtilizador = user.name || user.nome;
            const elNomes = ["user-nav-name", ".profile-name", "user-display-name"];
            elNomes.forEach(id => {
                const el = document.querySelector(id.startsWith('.') ? id : `#${id}`);
                if (el) el.innerText = nomeUtilizador;
            });
        }
    } catch (erro) { console.error("Erro na Navbar:", erro); }
}

function injetarMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = `
        <div class="logo">SmartVaga</div>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="vagas.html">Vagas</a></li>
            <li><a href="carregamentos.html">Carregamentos</a></li>
            <li><a href="contactos.html">Contactos</a></li>
        </ul>
        <div class="user-profile" id="profile-menu-trigger" onclick="alternarMenuDropdown(event)">
            <svg class="profile-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span class="profile-name" id="user-nav-name">Carregando...</span>
            <div class="profile-dropdown" id="my-profile-dropdown">
                <a href="#" id="abrir-modal-perfil" onclick="ativarAbaLateral('perfil'); event.preventDefault();">📝 Editar Perfil</a>
                <hr>
                <a href="#" class="logout-item" id="btn-logout">❌ Terminar Sessão</a>
            </div>
        </div>
    `;

    // Acoplar dinamicamente a escuta do logout injetado
    const logoutBtn = container.querySelector("#btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            alert("Sessão terminada!");
            window.location.href = "login.html";
        });
    }
}

function setupEventosInterface() {
    const overlayPerfil = document.getElementById("overlay-modal-perfil");
    const btnFecharPerfil = document.getElementById("btn-fechar-modal");

    if (btnFecharPerfil && overlayPerfil) {
        btnFecharPerfil.addEventListener("click", () => overlayPerfil.style.display = "none");
    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'alternar-olho-pwd') {
            const inputPassword = document.getElementById('input-password');
            const iconeOlho = e.target;
            inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
            iconeOlho.textContent = inputPassword.type === 'password' ? '👁️' : '🙈';
        }
        
        const botaoAba = e.target.closest("#menu-perfil .btn-menu");
        if (botaoAba) {
            const botoesMenu = document.querySelectorAll("#menu-perfil .btn-menu");
            botoesMenu.forEach(b => b.classList.remove("active"));
            botaoAba.classList.add("active");
            mudarConteudoAba(botaoAba.getAttribute("data-aba"));
        }
    });

    const btnFecharPopup = document.getElementById("btn-fechar-popup");
    if (btnFecharPopup) {
        btnFecharPopup.addEventListener("click", () => {
            const overlayAdd = document.getElementById("overlay-add-veiculo");
            if (overlayAdd) overlayAdd.style.display = "none";
        });
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#profile-menu-trigger")) {
            const dropdown = document.getElementById("my-profile-dropdown");
            if (dropdown) dropdown.classList.remove("active");
        }
    });
}

async function repreencherCamposPerfil() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/utilizadores/me`, { headers: obterHeaders() });
        if (resposta.ok) {
            const user = await resposta.json();
            if (document.getElementById("input-nome")) {
                document.getElementById("input-nome").value = user.name || user.nome;
                document.getElementById("input-email").value = user.email;
            }
        }
    } catch (err) { console.error("Erro ao preencher perfil:", err); }
}

async function guardarPerfil() {
    const novoNome = document.getElementById('input-nome').value;
    const novoEmail = document.getElementById('input-email').value;
    const novaPassword = document.getElementById('input-password').value;

    const dadosAtualizados = { name: novoNome, email: novoEmail };
    if (novaPassword.trim() !== "") dadosAtualizados.password = novaPassword;

    try {
        const resposta = await fetch(`${API_BASE_URL}/utilizadores/me`, { 
            method: 'PUT',
            headers: obterHeaders(),
            body: JSON.stringify(dadosAtualizados)
        });

        if (resposta.ok) {
            alert('Perfil atualizado com sucesso!');
            const elNomes = ["user-nav-name", ".profile-name", "user-display-name"];
            elNomes.forEach(id => {
                const el = document.querySelector(id.startsWith('.') ? id : `#${id}`);
                if (el) el.innerText = novoNome;
            });
        } else {
            const erro = await resposta.json();
            alert('Erro ao atualizar: ' + (erro.message || 'Tenta novamente.'));
        }
    } catch (err) { alert('Erro de rede ao salvar.'); }
}

function mudarConteudoAba(aba) {
    const zonaConteudo = document.getElementById("zona-conteudo");
    if (!zonaConteudo) return;

    if (aba === "perfil") {
        zonaConteudo.innerHTML = `
            <div class="aba-titulo"><h3>📝 Editar Perfil</h3></div>
            <form class="form-perfil" id="form-editar-perfil">
                <div class="form-linha">
                    <div class="form-grupo"><label>Nome</label><input type="text" id="input-nome"></div>
                    <div class="form-grupo"><label>Email</label><input type="email" id="input-email"></div>
                </div>
                <div class="form-linha">
                    <div class="form-grupo m-metade">
                        <label>Nova Password</label>
                        <div class="input-password-wrapper" style="position: relative; display: flex; align-items: center;">
                            <input type="password" id="input-password" placeholder="••••••••••••" style="width: 100%; padding-right: 40px;">
                            <span id="alternar-olho-pwd" style="position: absolute; right: 12px; cursor: pointer; z-index: 10;">👁️</span>
                        </div>
                    </div>
                </div>
                <div class="form-acoes" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="submit" class="btn-acao btn-editar" style="background-color: #5b6b47; color: white;">📝 Editar</button>
                    <button type="button" class="btn-acao btn-eliminar" style="background-color: #bd4b4b; color: white;">🗑️ Eliminar conta</button>
                </div>
            </form>
        `;
        const formEditar = document.getElementById("form-editar-perfil");
        if (formEditar) {
            formEditar.addEventListener("submit", async (e) => {
                e.preventDefault();
                await guardarPerfil(); 
            });
        }
        repreencherCamposPerfil();
    }
    else if (aba === "atividade") {
        const historico = JSON.parse(localStorage.getItem('historico_atividades')) || [];
        let conteudoHistorico = '';

        if (historico.length === 0) {
            conteudoHistorico = `<p class="texto-vazio" style="margin: 0; color: #111;">Sem histórico de atividade</p>`;
        } else {
            conteudoHistorico = `<div class="lista-atividades" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px;">`;
            historico.forEach(item => {
                conteudoHistorico += `
                    <div class="item-atividade" style="padding: 10px 14px; background-color: #f4f6f2; border-left: 4px solid #5b6b47; border-radius: 4px;">
                        <p style="margin: 0 0 3px 0; color: #222; font-size: 14px; font-weight: 500;">${item.texto}</p>
                        <span style="font-size: 11px; color: #666; display: block;">🕒 ${item.data}</span>
                    </div>
                `;
            });
            conteudoHistorico += `</div>`;
        }

        zonaConteudo.innerHTML = `
            <div class="aba-titulo"><h3 style="color: #4b5e30;">🕒 Atividade</h3></div>
            <div class="caixa-historico" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">${conteudoHistorico}</div>
        `;
    }
    else if (aba === "garagem") {
        zonaConteudo.innerHTML = `
            <div class="aba-titulo"><h3 style="color: #4b5e30;">🚗 Garagem</h3></div>
            <div class="caixa-historico" id="lista-veiculos">
                <p class="texto-vazio" style="margin: 0;">A carregar veículos...</p>
            </div>
            <div class="form-acoes-garagem" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                <button type="button" class="btn-acao btn-add-veiculo" id="btn-abrir-add-veiculo" style="background-color: #5b6b47; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">+ Adicionar Veículo</button>
            </div>
        `;

        const btnAbrirAdd = document.getElementById("btn-abrir-add-veiculo");
        if (btnAbrirAdd) {
            btnAbrirAdd.addEventListener("click", () => {
                const overlayAdd = document.getElementById("overlay-add-veiculo");
                if (overlayAdd) overlayAdd.style.display = "flex";
            });
        }
        carregarVeiculosGaragem();
    } else {
        zonaConteudo.innerHTML = `
            <div class="aba-titulo"><h3>💳 Pagamento</h3></div>
            <div class="caixa-historico"><p class="texto-vazio">Em desenvolvimento...</p></div>
        `;
    }
}

window.ativarAbaLateral = function(aba) {
    const overlayPerfil = document.getElementById("overlay-modal-perfil");
    if (overlayPerfil) {
        overlayPerfil.style.display = "flex";
        mudarConteudoAba(aba);
        
        setTimeout(() => {
            const botoesMenu = document.querySelectorAll("#menu-perfil .btn-menu");
            botoesMenu.forEach(b => {
                if (b.getAttribute("data-aba") === aba) b.classList.add("active");
                else b.classList.remove("active");
            });
        }, 50);
    }
};

window.alternarMenuDropdown = function(evento) {
    if (evento) evento.stopPropagation();
    const dropdown = document.getElementById("my-profile-dropdown");
    if (dropdown) dropdown.classList.toggle("active");
};

async function atualizarContadoresDashboard() {
    const token = localStorage.getItem("token");
    
    // Procura os cartões originais do teu HTML através da classe nativa
    const cartoesNumeros = document.querySelectorAll(".stat-card .number");

    // Segurança: Se não estiveres na página das vagas, sai silenciosamente sem quebrar o JS
    if (!cartoesNumeros || cartoesNumeros.length < 3) return;

    try {
        // CORREÇÃO: Mudado de API_URL para API_BASE_URL para bater certo com o topo do teu ficheiro
        const resposta = await fetch(`${API_BASE_URL}/vagas`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            console.error("Erro ao carregar dados das vagas");
            return;
        }

        const listaVagas = await resposta.json();

        // Inicializar os contadores
        let livresCombustao = 0;
        let livresEletricas = 0;
        let reservadas = 0;

        // Fazer as contas com base no teu modelo Sequelize
        listaVagas.forEach(vaga => {
            const estadoVaga = parseInt(vaga.estado);

            if (estadoVaga === 1) {
                reservadas++;
            } else if (estadoVaga === 0) {
                if (vaga.tipo === 'eletrico') {
                    livresEletricas++;
                } else {
                    livresCombustao++;
                }
            }
        });

        // Injetar os valores pelas posições exatas dos teux stat-cards originais
        cartoesNumeros[0].innerText = livresCombustao;
        cartoesNumeros[1].innerText = livresEletricas;
        cartoesNumeros[2].innerText = reservadas;

        console.log(`📊 Dashboard Atualizado: ${livresCombustao} Livres | ${livresEletricas} Elétricas | ${reservadas} Reservadas`);

    } catch (erro) {
        console.error("❌ Erro ao calcular estatísticas do parque:", erro);
    }
}

// CORREÇÃO: Adicionar a chamada diretamente dentro do teu DOMContentLoaded principal lá de cima!
// Mas para testares já, podes deixar esta escuta limpa no fundo:
if (window.location.pathname.includes("vagas.html") || document.querySelector(".cards-grid")) {
    document.addEventListener("DOMContentLoaded", () => {
        atualizarContadoresDashboard();
    });
}