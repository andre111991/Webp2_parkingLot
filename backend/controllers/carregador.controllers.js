import { Carregador } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Iniciar Carregamento
export const IniciarCarregamento = async (req, res, next) => {
    try {
        const { id_carregador, id_veiculo } = req.body;
        const id_utilizador = req.userId; // Verificar com o token

        // Validação básica de campos obrigatórios
        if (!id_carregador || !id_veiculo) {
            const error = validationError("Os campos id_carregador e id_veiculo são obrigatórios.");
            error.status = 400;
            return next(error);
        }

        //Sucess response
        res.status(201).json({
            status: "sucesso",
            mensagem: "Carregamento iniciado com sucesso!",
            dados: {
                id_utilizador,
                id_carregador,
                id_veiculo,
                data_inicio: new Date(),
                estado: "em curso"
            }
        });

        // Error responses: 404 Not Found
        if (!id_carregador || !id_veiculo) {
            const error = validationError("Os campos id_carregador e id_veiculo são obrigatórios.");
            error.status = 404;
            return next(error);
        }

    } catch (error) {
        next(genericError(error.message));
    }
};

// 2. Para o carregamento e faz o pagamento
export const FinalizarCarregamento = async (req, res, next) => {
    try {
        const { id } = req.params;

        const custoProvisorio = 14.50; 

        //Sucess response
        res.status(200).json({
            status: "sucesso",
            mensagem: `Carregamento ${id} finalizado com sucesso!`,
            dados: {
                id_carregamento: parseInt(id),
                data_fim: new Date(),
                estado: "pago",
                total_pago: custoProvisorio,
                moeda: "EUR"
            }
        });
    } catch (error) {
        next(genericError(error.message));
    }
};

// 3. Utilizador vê carregamentos feitos anteriormente, mas apenas o dele!
export const HistoricoCarregamentos = async (req, res, next) => {
    try {
        const { id } = req.params;
        //Error responses: 403 Forbidden
        if (req.userTipo !== 'admin' && req.userId !== parseInt(id)) {
            const error = validationError("Não tens permissão para ver o histórico deste utilizador.");
            error.status = 403;
            return next(error);
        }

        // Mock de dados para o Postman simular o que viria do MySQL
        const historicoMock = [
            { id: 101, id_carregador: 2, data: "2026-05-19", total_pago: 8.20 },
            { id: 102, id_carregador: 5, data: "2026-05-20", total_pago: 12.45 }
        ];

        //Sucess response
        res.status(200).json({
            status: "sucesso",
            utilizador_id: parseInt(id),
            total_registos: historicoMock.length,
            dados: historicoMock
        });
    } catch (error) {
        next(genericError(error.message));
    }
};