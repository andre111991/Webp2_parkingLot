import { validationError, forbiddenError, notFoundError } from '../utils/error.utils.js';
import { Vaga, Veiculo } from '../models/db.config.js';

export const validarCompatibilidade = async (req, res, next) => {
    try {
        const { id_vaga, id_veiculo } = req.body;

        // 1. Consultas únicas
        const vaga = await Vaga.findByPk(id_vaga);
        const veiculo = await Veiculo.findByPk(id_veiculo);

        if (!vaga) return next(notFoundError("Vaga"));
        if (!veiculo) return next(notFoundError("Veículo"));

        // 2. Validação da Vaga (Tem de ser elétrica para carregamento)
        if (vaga.tipo !== 'eletrico') {
            return next(validationError({ 
                field: "vaga", 
                message: "Não é possível iniciar um carregamento numa vaga de combustão." 
            }));
        }

        // 3. Validação do Veículo (Tem de ser elétrico)
        if (veiculo.tipo_combustivel !== 'eletrico') {
            return next(validationError({ 
                field: "veiculo", 
                message: "Apenas veículos elétricos podem carregar." 
            }));
        }

        // Se passar nas duas, segue para o controlador
        next();
    } catch (error) {
        next(error);
    }
};