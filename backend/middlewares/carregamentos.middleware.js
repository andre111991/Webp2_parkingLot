import { validationError, forbiddenError, notFoundError } from '../utils/error.utils.js';
import { Vaga, Veiculo } from '../models/db.config.js';

export const validarCompatibilidadeEletrica = async (req, res, next) => {
    try {
        const { id_vaga, id_veiculo } = req.body;

        const vaga = await Vaga.findByPk(id_vaga);
        const veiculo = await Veiculo.findByPk(id_veiculo);

        if (!vaga || !veiculo) return next(notFoundError("Vaga ou Veículo"));

        if (vaga.tipo !== 'eletrico' || veiculo.tipo_combustivel !== 'eletrico') {
            return next(validationError([{ field: "compatibilidade", message: "Tanto a vaga como o veículo devem ser elétricos." }]));
        }

        next();
    } catch (error) {
        next(error);
    }
};