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
    if (painelId === 'vagas') console.log("Carregar vagas..."); 
    if (painelId === 'veiculos') console.log("Carregar veículos..."); 
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

        // Apanha o array 'users' que o teu back-end envia
        const listaFinal = dadosVindosDoBackend.users || [];

        if (listaFinal.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum utilizador encontrado.</td></tr>`;
            return;
        }

        // Adicionámos o 'index' para fazer a contagem automática sequencial (0, 1, 2...)
        listaFinal.forEach((user, index) => {
            // Soma 1 ao index para começar no #1 em vez do #0
            const numeroAutomatico = index + 1;
            
            tabela.innerHTML += `
                <tr>
                    <td>#${numeroAutomatico}</td>
                    <td>${user.name || user.nome || 'Sem Nome'}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="btn-delete" 
                                style="border: 1px solid #bd4b4b; color: #bd4b4b; background: white; padding: 5px 15px; border-radius: 20px; cursor: pointer;" 
                                onclick="eliminarUtilizador(${numeroAutomatico})">
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

// Função de Logout
function fazerLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}