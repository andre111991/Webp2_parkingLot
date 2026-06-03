import { validationError, notFoundError, forbiddenError } from '../utils/error.utils.js';
import { Veiculo, Vaga } from '../models/db.config.js';

// 1. Validação dos campos de entrada

export const validarReservaInput = (req, res, next) => {
    // 1. Validação de segurança: Body vazio
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(validationError({ 
            geral: ["O corpo do pedido está vazio. Campos necessários: id_veiculo, id_vaga, data_hora_inicio, data_hora_fim."] 
        }));
    }

    const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim } = req.body;
    const errors = {};

    // 2. Validação individual dos campos
    if (!id_veiculo) errors.id_veiculo = ["O id_veiculo é obrigatório."];
    if (!id_vaga) errors.id_vaga = ["O id_vaga é obrigatório."];
    if (!data_hora_inicio) errors.data_hora_inicio = ["A data_hora_inicio é obrigatória."];
    if (!data_hora_fim) errors.data_hora_fim = ["A data_hora_fim é obrigatória."];

    // 3. Validação de lógica de datas
    if (data_hora_inicio && data_hora_fim) {
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);

        // Verifica se a data é válida (não é um "Invalid Date")
        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            errors.datas = ["Formato de data inválido. Use o formato ISO (YYYY-MM-DDTHH:mm:ssZ)."];
        } else if (fim <= inicio) {
            errors.data_hora_fim = ["A data_hora_fim deve ser posterior à data_hora_inicio."];
        }
    }

    // 4. Se houver erros, retorna a estrutura consistente
    if (Object.keys(errors).length > 0) {
        return next(validationError(errors));
    }

    next();
};

// 2. Validação de segurança: Utilizador é dono do veículo?
export const verificarDonoDoVeiculo = async (req, res, next) => {
    try {
        const { id_veiculo } = req.body;
        const veiculo = await Veiculo.findByPk(id_veiculo);

        if (!veiculo) return next(notFoundError("Veículo"));
        
        if (veiculo.id_utilizador !== req.user.id) {
            return next(forbiddenError("Este veículo não pertence à tua conta"));
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const verificarDonoDaReserva = async (req, res, next) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id);
        if (!reserva) return next(notFoundError("Reserva"));
        
        if (reserva.id_utilizador !== req.user.id) {
            return next(forbiddenError("Não podes apagar uma reserva que não é tua"));
        }
        next();
    } catch (error) {
        next(error);
    }
};