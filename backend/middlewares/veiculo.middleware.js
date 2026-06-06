import { validationError,notFoundError,forbiddenError} from '../utils/error.utils.js';
import { Veiculo,Reserva,Carregamento } from '../models/db.config.js';

// 1. Validação do input 
export const validarVeiculoInput = (req, res, next) => {
    const { matricula, tipo_combustivel } = req.body;
    const errors = {};

    if (!matricula) errors.matricula = ["A matrícula é obrigatória"];
    if (!tipo_combustivel) {
        errors.tipo_combustivel = ["O tipo de combustível é obrigatório"];
    } else if (!['eletrico', 'combustao'].includes(tipo_combustivel.toLowerCase())) {
        errors.tipo_combustivel = ["Deve ser 'eletrico' ou 'combustao'"];
    }

    if (Object.keys(errors).length > 0) {
        return next(validationError(errors));
    }
    
    req.body.tipo_combustivel = tipo_combustivel.toLowerCase();
    next();
};

// 2. Validação de permissão (Dono)
export const verificarDonoVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findByPk(req.params.id);
        
        if (!veiculo) return next(notFoundError("Veículo"));
        
        if (veiculo.id_utilizador !== req.user.id) {
            return next(forbiddenError("Não tens permissão para este veículo"));
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const verificarDependenciasExclusao = async (req, res, next) => {
    try {
        const { id } = req.params; // Assumindo que o ID do veículo vem no parâmetro da rota

        // 1. Verifica se existem Reservas associadas ao veículo
        const reservaExistente = await Reserva.findOne({ where: { id_veiculo: id } });
        if (reservaExistente) {
            return next(validationError({ 
                message: "Não é possível apagar este veículo. Existe uma reserva associada. Por favor, apague a reserva primeiro." 
            }));
        }

        // 2. Verifica se existem Carregamentos associados ao veículo
        const carregamentoExistente = await Carregamento.findOne({ where: { id_veiculo: id } });
        if (carregamentoExistente) {
            return next(validationError({ 
                message: "Não é possível apagar este veículo. Existe um carregamento associado. Por favor, apague o carregamento primeiro." 
            }));
        }

        next(); // Se não existir nada, prossegue para o controlador de delete
    } catch (error) {
        next(error);
    }
};