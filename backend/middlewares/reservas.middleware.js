import { validationError, notFoundError, forbiddenError } from '../utils/error.utils.js';
import { Veiculo, Vaga } from '../models/db.config.js';

// 1. Validação dos campos de entrada

export const validarReservaInput = (req, res, next) => {
    const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim } = req.body;
    const errors = {};

    if (!id_veiculo) errors.id_veiculo = ["O veículo é obrigatório"];
    if (!id_vaga) errors.id_vaga = ["A vaga é obrigatória"];
    if (!data_hora_inicio) errors.data_hora_inicio = ["Data de início é obrigatória"];
    if (!data_hora_fim) errors.data_hora_fim = ["Data de fim é obrigatória"];

    if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
        errors.data_hora_fim = ["A data de fim deve ser posterior à de início"];
    }

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