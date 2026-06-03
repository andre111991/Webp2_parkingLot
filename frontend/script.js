document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Selecionar todos os botões do menu lateral e a zona onde o conteúdo muda
    const botoesMenu = document.querySelectorAll("#menu-perfil .btn-menu");
    const zonaConteudo = document.getElementById("zona-conteudo");

    // 2. Ficar atento a qual botão o utilizador clica
    botoesMenu.forEach(botao => {
        botao.addEventListener("click", () => {
            
            // Remover o estilo verde-escuro (.active) de todos os botões
            botoesMenu.forEach(b => b.classList.remove("active"));
            
            // Adicionar o estilo verde-escuro apenas ao botão que foi clicado
            botao.classList.add("active");

            // Ver qual é a aba pretendida (perfil, atividade, garagem, pagamento)
            const abaSelecionada = botao.getAttribute("data-aba");

            // Mudar o HTML central dinamicamente
            mudarConteudoAba(abaSelecionada);
        });
    });

    // 3. Função mágica que redesenha o interior do ecrã conforme a aba
    function mudarConteudoAba(aba) {
        if (aba === "perfil") {
            zonaConteudo.innerHTML = `
                <div class="aba-titulo">
                    <h3>📝 Editar Perfil</h3>
                </div>
                <form class="form-perfil" id="form-editar-perfil">
                    <div class="form-linha">
                        <div class="form-grupo">
                            <label for="input-nome">Nome</label>
                            <input type="text" id="input-nome" placeholder="O teu nome">
                        </div>
                        <div class="form-grupo">
                            <label for="input-email">Email</label>
                            <input type="email" id="input-email" placeholder="O teu email">
                        </div>
                    </div>
                    <div class="form-linha">
                        <div class="form-grupo m-metade">
                            <label for="input-password">Password</label>
                            <input type="password" id="input-password" placeholder="••••••••">
                        </div>
                    </div>
                    <div class="form-acoes">
                        <button type="submit" class="btn-acao btn-editar">📝 Editar</button>
                        <button type="button" class="btn-acao btn-eliminar">🗑️ Eliminar conta</button>
                    </div>
                </form>
            `;
        } 
        else if (aba === "atividade") {
            zonaConteudo.innerHTML = `
                <div class="aba-titulo">
                    <h3>🕒 Atividade</h3>
                </div>
                <div class="caixa-historico">
                    <p class="texto-vazio">Sem histórico de atividade</p>
                </div>
            `;
        } 
        else if (aba === "garagem") {
            zonaConteudo.innerHTML = `
                <div class="aba-titulo">
                    <h3>🚗 Garagem</h3>
                </div>
                <div class="caixa-historico" id="lista-veiculos"></div>
                <div class="form-acoes-garagem">
                    <button type="button" class="btn-acao btn-add-veiculo" id="btn-abrir-add-veiculo">+ Adicionar Veículo</button>
                    <button type="button" class="btn-acao btn-editar">📝 Editar</button>
                    <button type="button" class="btn-acao btn-eliminar">🗑️ Eliminar</button>
                </div>
            `;
            
            // Lógica para abrir o pop-up verde de adicionar veículo
            document.getElementById("btn-abrir-add-veiculo").addEventListener("click", () => {
                document.getElementById("overlay-add-veiculo").style.display = "flex";
            });
        } 
        else if (aba === "pagamento") {
            zonaConteudo.innerHTML = `
                <div class="aba-titulo">
                    <h3>💳 Pagamento</h3>
                </div>
                <div class="caixa-historico">
                    <p class="texto-vazio">Nenhum método de pagamento associado.</p>
                </div>
            `;
        }
    }

    // Lógica para fechar o pop-up verde se carregares no X dele
    const btnFecharPopup = document.getElementById("btn-fechar-popup");
    if (btnFecharPopup) {
        btnFecharPopup.addEventListener("click", () => {
            document.getElementById("overlay-add-veiculo").style.display = "none";
        });
    }
});