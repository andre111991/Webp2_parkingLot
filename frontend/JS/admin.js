// admin.js
const API_URL = "http://localhost:3000"; 

document.addEventListener("DOMContentLoaded", () => {
    // Verificar acesso
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const EMAIL_ADMIN_CORRETO = "admin1@admin.com"; 

    // Se quiseres ativar a barreira de segurança mais tarde, descomenta este bloco:
    /*
    if (!token || email?.toLowerCase() !== EMAIL_ADMIN_CORRETO.toLowerCase()) {
        alert("Acesso restrito apenas ao Administrador!");
        window.location.href = "login.html";
        return;
    }
    */

    // Carrega os utilizadores logo ao entrar
    carregarUtilizadores();
});

// Alternar entre painéis
function mudarPainel(painelId) {
    document.querySelectorAll('.painel-conteudo').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));

    const painel = document.getElementById(`painel-${painelId}`);
    if (painel) painel.style.display = 'block';
    
    const btn = document.querySelector(`button[onclick="mudarPainel('${painelId}')"]`);
    if (btn) btn.classList.add('active');

    if (painelId === 'users') carregarUtilizadores();
    if (painelId === 'vagas') carregarVagas();
    if (painelId === 'veiculos') carregarVeiculos(); 
}

// Carregar utilizadores do Back-end
async function carregarUtilizadores() {
    const token = localStorage.getItem("token");
    const tabela = document.getElementById("tabela-users");

    if (!tabela) return;

    try {
        const resposta = await fetch(`${API_URL}/utilizadores/admin`, { 
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            console.error(`Erro no servidor: Status ${resposta.status}`);
            return;
        }

        const dadosVindosDoBackend = await resposta.json();
        tabela.innerHTML = ""; 

        const listaFinal = dadosVindosDoBackend.users || [];

        if (listaFinal.length === 0) {
            tabela.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum utilizador encontrado.</td></tr>`;
            return;
        }

        listaFinal.forEach((user, index) => {
            const numeroAutomatico = index + 1;
            
            let estadoPagamento = "Regularizado";
            let corBadge = "#2e7d32"; 

            if (user.tipo_utilizador === "admin") {
                estadoPagamento = "Isento";
                corBadge = "#4a69bd"; 
            }
            
            tabela.innerHTML += `
                <tr>
                    <td>#${numeroAutomatico}</td>
                    <td>${user.name || user.nome || 'Sem Nome'}</td>
                    <td>${user.email}</td>
                    <td>
                        <span style="background: ${corBadge}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block;">
                            ${estadoPagamento}
                        </span>
                    </td>
                    <td>
                        <button class="btn-delete" 
                                style="border: 1px solid #bd4b4b; color: #bd4b4b; background: white; padding: 5px 15px; border-radius: 20px; cursor: pointer;" 
                                // Substitui a tua linha do onclick por esta:
                                onclick="eliminarUtilizador(${user.id_utilizador || user.id})">
                            Apagar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) {
        console.error("❌ Erro ao carregar tabela:", erro);
    }
}

// Função para eliminar utilizador
async function eliminarUtilizador(id) {
    if (!confirm(`Tens a certeza que queres apagar o utilizador #${id}?`)) return;
    console.log("A apagar utilizador com ID:", id);
}

// Carregar vagas do Back-end
async function carregarVagas() {
    const token = localStorage.getItem("token");
    const tabela = document.getElementById("tabela-vagas");

    if (!tabela) return;

    try {
        const resposta = await fetch(`${API_URL}/vagas`, { 
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            console.error(`Erro ao carregar vagas: Status ${resposta.status}`);
            return;
        }

        const dadosVagas = await resposta.json();
        tabela.innerHTML = ""; 

        const listaVagas = Array.isArray(dadosVagas) ? dadosVagas : (dadosVagas.vagas || []);

        if (listaVagas.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma vaga registada no sistema.</td></tr>`;
            return;
        }

        listaVagas.forEach((vaga, index) => {
            const numeroAutomatico = index + 1;
            const estadoVaga = vaga.estado !== undefined ? vaga.estado : (vaga.status || 0);
            const ehOcupada = [1, "1", "ocupada", "indisponivel"].includes(estadoVaga);
            
            const textoEstado = ehOcupada ? "Ocupada" : "Livre";
            const corBadge = ehOcupada ? "#bd4b4b" : "#2e7d32"; 

            tabela.innerHTML += `
                <tr>
                    <td>#${numeroAutomatico}</td>
                    <td>${vaga.numero || vaga.nome || 'Vaga ' + (vaga.id_vaga || numeroAutomatico)}</td>
                    <td>
                        <span style="background: ${corBadge}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block;">
                            ${textoEstado}
                        </span>
                    </td>
                    <td>
                        <button class="btn-delete" 
                                style="border: 1px solid #bd4b4b; color: #bd4b4b; background: white; padding: 5px 15px; border-radius: 20px; cursor: pointer;" 
                                onclick="eliminarVaga(${vaga.id_vaga || numeroAutomatico})">
                            Apagar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) {
        console.error("❌ Erro ao carregar tabela de vagas:", erro);
    }
}

// Função para libertar a vaga (mudar estado para Livre)
async function eliminarVaga(idVaga) {
    if (!confirm(`Tens a certeza que desejas libertar a vaga #${idVaga}? O estado mudará para Livre.`)) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const resposta = await fetch(`${API_URL}/vagas/admin/${idVaga}`, {
            method: "PUT", 
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ estado: "0" })
        });

        if (resposta.ok) {
            alert("Vaga libertada com sucesso! O estado mudou para Livre.");
            carregarVagas(); 
        } else {
            const erroDetalhado = await resposta.json().catch(() => ({}));
            alert("Erro ao libertar vaga: " + (erroDetalhado.message || "Não foi possível concluir a ação."));
        }
    } catch (erro) {
        console.error("❌ Erro crítico ao libertar vaga:", erro);
        alert("Falha de comunicação com o servidor.");
    }
}

// Carregar veículos do Back-end
async function carregarVeiculos() {
    const token = localStorage.getItem("token");
    const tabela = document.getElementById("tabela-veiculos");
    if (!tabela) return;

    try {
        const resUsers = await fetch(`${API_URL}/utilizadores/admin`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const dadosUsers = await resUsers.json();
        const listaUsers = Array.isArray(dadosUsers) ? dadosUsers : (dadosUsers.users || dadosUsers.utilizadores || []);

        const resposta = await fetch(`${API_URL}/veiculos/admin/all`, { 
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const dadosRecebidos = await resposta.json();
        
        tabela.innerHTML = ""; 
        const listaUtilizadoresComVeiculos = Array.isArray(dadosRecebidos) ? dadosRecebidos : [];
        let contadorLinhas = 0;

        const mapaUtilizadores = {};
        listaUsers.forEach((u, index) => {
            const idReal = u.id_utilizador || u.id || (index + 1);
            mapaUtilizadores[idReal] = u.email;
        });

        listaUtilizadoresComVeiculos.forEach(registo => {
            const idDono = registo.id_utilizador;
            let emailDono = mapaUtilizadores[idDono];

            if (!emailDono && listaUsers[idDono - 1]) {
                emailDono = listaUsers[idDono - 1].email;
            }

            if (!emailDono) {
                emailDono = "Utilizador Comum";
            }

            const arrayCarros = registo.Veiculos || [];

            arrayCarros.forEach(veiculo => {
                contadorLinhas++;
                
                // 🔥 SOLUÇÃO: Vamos buscar o ID real que o teu Back-end agrupou dentro do array
                const idVeiculoReal = veiculo.id_veiculo;
                const matriculaReal = veiculo.matricula ? String(veiculo.matricula).toUpperCase() : "SEM MATRÍCULA";

                tabela.innerHTML += `
                    <tr>
                        <td>#${contadorLinhas}</td> <td style="font-family: monospace; font-weight: bold; letter-spacing: 1px;">${matriculaReal}</td>
                        <td style="color: #333; font-size: 14px;">${emailDono}</td>
                        <td>
                            <button class="btn-delete" 
                                    style="border: 1px solid #bd4b4b; color: #bd4b4b; background: white; padding: 5px 15px; border-radius: 20px; cursor: pointer;" 
                                    onclick="eliminarVeiculo(${idVeiculoReal})"> Apagar
                            </button>
                        </td>
                    </tr>
                `;
            });
        });

        if (contadorLinhas === 0) {
            tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum veículo registado no sistema.</td></tr>`;
        }

    } catch (erro) {
        console.error("❌ Erro ao listar veículos no front-end:", erro);
    }
}

// Função para apagar o veículo através do painel Admin
async function eliminarUtilizador(id) {
    if (!confirm(`Tens a certeza que queres apagar o utilizador ID #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");

        const resposta = await fetch(
            `http://localhost:3000/utilizadores/admin/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (resposta.ok) {
            alert("Utilizador eliminado com sucesso!");
            carregarUtilizadores();
        }
    } catch (erro) {
        console.error(erro);
    }
}

// 1. Função para apagar utilizador
async function eliminarUtilizador(id) {
    if (!confirm(`Tens a certeza que queres apagar o utilizador ID #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        
        // Se o teu servidor espera /utilizadores/admin/:id, usa esta linha:
        const url = `http://localhost:3000/utilizadores/admin/${id}`;
        
        const resposta = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (resposta.ok) {
            alert("Utilizador eliminado com sucesso!");
            carregarUtilizadores(); // Atualiza a tabela no ecrã
        } else {
            const erro = await resposta.json().catch(() => ({}));
            alert("Erro do servidor: " + (erro.message || "Não foi possível apagar."));
        }
    } catch (erro) {
        console.error("Erro na eliminação:", erro);
        alert("Erro de comunicação com o servidor.");
    }
}
// Função de Logout
function fazerLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}