import { Carregamento, Carregador } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Iniciar Carregamento
export const iniciarCarregamento = async (req, res, next) => {
    try {
        const { id_vaga, id_veiculo, id_carregador } = req.body;
        const id_utilizador = req.userId; 

        // Erro 400: Validação de campos obrigatórios
        if (!id_vaga || !id_veiculo || !id_carregador) {
            const error = validationError("Os campos id_vaga, id_veiculo e id_carregador são obrigatórios.");
            error.status = 400;
            return next(error);
        }

        const idCarregamentoSimulado = Math.floor(Math.random() * 1000) + 1;

        return res.status(201).json({
            status: "sucesso",
            mensagem: "Carregamento iniciado e posto físico vinculado com sucesso!",
            dados: {
                id_carregamento: idCarregamentoSimulado,
                id_utilizador,
                id_vaga: parseInt(id_vaga),
                id_veiculo: parseInt(id_veiculo),
                id_carregador: parseInt(id_carregador),
                data_hora_inicio: new Date(),
                pago: 0,
                valor: 0.0
            }
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

// 2. Parar o carregamento e fazer o pagamento
export const finalizarCarregamento = async (req, res, next) => {
    try {
        const { id } = req.params; 

        // Erro 400: Validação de ID ausente no URL
        if (!id) {
            const error = validationError("O ID do carregamento é obrigatório no URL.");
            error.status = 400;
            return next(error);
        }

        // Procura primeiro se o carregamento existe na BD
        const carregamentoExistente = await Carregamento.findByPk(parseInt(id));

        // Erro 404: Se o carregamento com esse ID não for encontrado
        if (!carregamentoExistente) {
            const error = new Error(`O carregamento com o ID ${id} não existe.`);
            error.status = 404;
            return next(error);
        }

        const custoProvisorio = 14.50; // Valor fixo para simular o custo do carregamento (em euros)

        //Atualiza o estado do Carregamento para pago e define a hora de fim
        await Carregamento.update(
            { 
                data_hora_fim: new Date(),
                pago: 1, // 1 = Pago (0 = Não pago)
                valor: custoProvisorio
            },
            { where: { id_carregamento: parseInt(id) } }
        );

        //Liberta o Carregador físico associado (coloca id_carregamento a NULL)
        await Carregador.update(
            { id_carregamento: null },
            { where: { id_carregamento: parseInt(id) } }
        );

        // Sucess response
        return res.status(200).json({
            status: "sucesso",
            mensagem: `Carregamento ${id} finalizado e pago com sucesso!`,
            dados: {
                id_carregamento: parseInt(id),
                data_hora_fim: new Date(),
                pago: 1,   // 1 = Pago (0 = Não pago)
                valor: custoProvisorio,
                moeda: "EUR"
            }
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

// 3. Histórico de Carregamentos (Apenas do próprio utilizador ou admin)
export const historicoCarregamentos = async (req, res, next) => {
    try {
        // O ID do utilizador cujo histórico queremos ver vem do URL (ex: /carregamentos/utilizador/:id)
        const { id } = req.params;
        
        // Erro 403: Segurança para impedir que utilizadores normais vejam dados de outros
        if (req.userTipo !== 'admin' && req.userId !== parseInt(id)) {
            const error = validationError("Não tens permissão para ver o histórico deste utilizador.");
            error.status = 403;
            return next(error);
        }
        
        // Procura todos os carregamentos associados aos veículos deste utilizador específico
        const listaCarregamentos = await Carregamento.findAll({
            where: { '$Veiculo.id_utilizador$': parseInt(id) },
            include: ['Veiculo'] // Fazer JOIN com a tabela veículo para saber de quem é
        });

        // ERRO 404: Se a lista vier vazia, significa que o utilizador nunca carregou ali
        if (!listaCarregamentos || listaCarregamentos.length === 0) {
            const error = new Error("Este utilizador ainda não efetuou carregamentos");
            error.status = 404;
            return next(error);
        }

        return res.status(200).json({
            status: "sucesso",
            utilizador_id: parseInt(id),
            total_registos: listaCarregamentos.length,
            dados: listaCarregamentos
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

//------------------------------------------------ADMIN-------------------------------------------------------------------
// 4.Listar TODOS os carregamentos do parque de todos os utilizadores
export const listarTodosCarregamentos = async (req, res, next) => {
    try {
        //vai buscar tudo e faz JOIN com os Veículos
        const todosCarregamentos = await Carregamento.findAll({
            include: ['Veiculo']
        });

        // Erro 404: Se não houver nenhum carregamento registado no sistema, ou seja, a tabela estiver vazia
        if (!todosCarregamentos || todosCarregamentos.length === 0) {
            const error = new Error("Não existem registos de carregamentos no sistema.");
            error.status = 404;
            return next(error);
        }

        return res.status(200).json({
            status: "sucesso",
            total: todosCarregamentos.length,
            dados: todosCarregamentos
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

// 5.Eliminar um carregamento por ID (ex: erro no posto, cancelamento)
export const deleteCarregamento = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Erro 400: Validação de ID ausente
        if (!id) {
            const error = validationError("O ID do carregamento é obrigatório no URL.");
            error.status = 400;
            return next(error);
        }

        // Verificar se ele existe antes de apagar
        const carregamento = await Carregamento.findByPk(parseInt(id));
        
        // Erro 404: Se o carregamento não existir
        if (!carregamento) {
            const error = new Error(`O carregamento com o ID ${id} não foi encontrado.`);
            error.status = 404;
            return next(error);
        }

        //Eliminar da base de dados
        await Carregamento.destroy({
            where: { id_carregamento: parseInt(id) }
        });

        return res.status(200).json({
            status: "sucesso",
            mensagem: `Carregamento com o ID ${id} foi eliminado com sucesso pelo administrador.`
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};