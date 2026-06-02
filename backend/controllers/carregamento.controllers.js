import { Carregamento, Vaga, Veiculo, Reserva } from '../models/db.config.js';
import { notFoundError, validationError, forbiddenError } from '../utils/error.utils.js';


export const iniciarCarregamento = async (req, res, next) => {
    try {
        // Lógica: Criar registo na tabela de Carregamento
        // Regista o timestamp de início e associa ao id_vaga e id_veiculo
        // ...
        res.status(201).json({ message: "Carregamento iniciado." });
    } catch (error) {
        next(error);
    }
};

export const finalizarCarregamento = async (req, res, next) => {
    try {
        // Lógica: Atualizar o timestamp de fim e calcular consumo/custo
        // ...
        res.status(200).json({ message: "Carregamento finalizado com sucesso." });
    } catch (error) {
        next(error);
    }
};