// 🌟 CONFIGURAÇÃO INICIAL
const API_BASE_URL = "http://localhost:3000";

function obterHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

// 🌟 ESCUTA O FORMULÁRIO DE REGISTO
const formRegisto = document.getElementById('formRegisto'); 
if (formRegisto) {
    formRegisto.addEventListener('submit', function(e) {
        e.preventDefault(); // Trava o erro 405

        // Apanha os dados dos inputs REAIS do teu registar.html
        const dadosFormulario = {
            name: document.getElementById('reg-nome').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-pass').value
        };

     fetch(`${API_BASE_URL}/utilizadores/registo`, {  // 🌟 Corrigido para /utilizadores/registo
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify(dadosFormulario)
    })
        .then(resposta => resposta.json())
        .then(resultado => {
            console.log("Resposta do servidor:", resultado);
            alert("Registo feito com sucesso!");
            window.location.href = "login.html"; // Redireciona após sucesso
        })
        .catch(erro => {
            console.error("Erro na ligação ao back-end:", erro);
            alert("Erro ao efetuar o registo.");
        });
    });
}

// 🌟 ESCUTA O FORMULÁRIO DE LOGIN (PRONTO PARA USAR)
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();

        const dadosLogin = {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-pass').value
        };

 fetch(`${API_BASE_URL}/utilizadores/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🌟 ESSENCIAL para o browser aceitar o cookie 'refreshToken' do teu backend
    body: JSON.stringify(dadosLogin)
})
        .then(res => {
            if (!res.ok) throw new Error("Credenciais inválidas");
            return res.json();
        })
        .then(data => {
            // Se o teu backend devolver um token, guardamo-lo aqui:
            if (data.token) localStorage.setItem("token", data.token);
            
            alert("Login efetuado com sucesso!");
            window.location.href = "vagas.html"; // Altera para a tua página principal (ex: index.html ou vagas.html)
        })
        .catch(err => {
            console.error(err);
            alert("Erro no login: Verifica os teus dados.");
        });
    });
}

// 🌟 PROTEÇÃO DE ROTAS (CORRIGIDO PARA NÃO DAR LOOP)
document.addEventListener("DOMContentLoaded", () => {
    const paginaAtual = window.location.pathname;

    // Se o utilizador estiver no login ou registo, NÃO corre a validação de Token
    if (paginaAtual.includes("login.html") || paginaAtual.includes("registar.html")) {
        return; 
    }

    // Se estiver em qualquer outra página (ex: index.html, vagas.html) obriga a ter Token
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 1. CARREGAR NOME LOGADO LOGO NO INÍCIO
    async function inicializarApp() {
        try {
            const resposta = await fetch(`${API_BASE_URL}/utilizadores/perfil`, {
                method: "GET",
                headers: obterHeaders()
            });
            if (resposta.ok) {
                const user = await resposta.json();
                if (document.getElementById("user-nav-name")) {
                    document.getElementById("user-nav-name").innerText = user.nome;
                }
                if (document.getElementById("user-display-name")) {
                    document.getElementById("user-display-name").innerText = user.nome;
                }
            }
        } catch (erro) {
            console.error("Erro ao ir buscar dados iniciais:", erro);
        }
    }
    inicializarApp();

    // 2. CONTROLO DE ABERTURA/FECHO DO MODAL DE PERFIL
    const overlayPerfil = document.getElementById("overlay-modal-perfil");
    const btnAbrirPerfil = document.getElementById("abrir-modal-perfil");
    const btnFecharPerfil = document.getElementById("btn-fechar-modal-perfil");

    if (btnAbrirPerfil && overlayPerfil) {
        btnAbrirPerfil.addEventListener("click", () => {
            overlayPerfil.style.display = "flex";
            mudarConteudoAba("perfil"); 
        });
    }

    if (btnFecharPerfil && overlayPerfil) {
        btnFecharPerfil.addEventListener("click", () => {
            overlayPerfil.style.display = "none";
        });
    }

    // 3. NAVEGAÇÃO ENTRE ABAS DO MENU
    const botoesMenu = document.querySelectorAll("#menu-perfil .btn-menu");
    botoesMenu.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesMenu.forEach(b => b.classList.remove("active"));
            botao.classList.add("active");
            mudarConteudoAba(botao.getAttribute("data-aba"));
        });
    });

    // 4. GESTOR DINÂMICO DE CONTEÚDO
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
                    <div class="form-acoes">
                        <button type="submit" class="btn-acao btn-editar">📝 Editar</button>
                    </div>
                </form>
            `;
            repreencherCamposPerfil();
        }
        else if (aba === "garagem") {
            zonaConteudo.innerHTML = `
                <div class="aba-titulo"><h3>🚗 Garagem</h3></div>
                <div class="caixa-historico" id="lista-veiculos">A carregar veículos...</div>
                <div class="form-acoes-garagem">
                    <button type="button" class="btn-acao btn-add-veiculo" id="btn-abrir-add-veiculo">+ Adicionar Veículo</button>
                </div>
            `;
            carregarVeiculosGaragem();

            const btnAbrirAdd = document.getElementById("btn-abrir-add-veiculo");
            if (btnAbrirAdd) {
                btnAbrirAdd.addEventListener("click", () => {
                    const overlayAdd = document.getElementById("overlay-add-veiculo");
                    if (overlayAdd) overlayAdd.style.display = "flex";
                });
            }
        }
    }

    // 5. FUNÇÕES DE ACESSO À VOSSA API REAL DO BACKEND
    async function repreencherCamposPerfil() {
        try {
            const resposta = await fetch(`${API_BASE_URL}/utilizadores/perfil`, { headers: obterHeaders() });
            if (resposta.ok) {
                const user = await resposta.json();
                if (document.getElementById("input-nome")) {
                    document.getElementById("input-nome").value = user.nome;
                    document.getElementById("input-email").value = user.email;
                }
            }
        } catch (err) { console.error(err); }
    }

    async function carregarVeiculosGaragem() {
        const lista = document.getElementById("lista-veiculos");
        if (!lista) return;
        try {
            const res = await fetch(`${API_BASE_URL}/veiculos`, { headers: obterHeaders() });
            const carros = await res.json();
            if (!carros || carros.length === 0) {
                lista.innerHTML = `<p class="texto-vazio">Sem veículos na garagem</p>`;
                return;
            }
            lista.innerHTML = "";
            carros.forEach(carro => {
                lista.innerHTML += `
                    <div class="item-veiculo" style="padding:10px; border-bottom:1px solid #eee; color:#000;">
                        <p><strong>[${carro.pais || 'PT'}] ${carro.matricula}</strong> - ${carro.alcunha}</p>
                    </div>`;
            });
        } catch (e) {
            lista.innerHTML = "Erro ao carregar.";
        }
    }

    // Configuração do fecho do pop-up verde
    const btnFecharPopup = document.getElementById("btn-fechar-popup");
    if (btnFecharPopup) {
        btnFecharPopup.addEventListener("click", () => {
            const overlayAdd = document.getElementById("overlay-add-veiculo");
            if (overlayAdd) overlayAdd.style.display = "none";
        });
    }
});