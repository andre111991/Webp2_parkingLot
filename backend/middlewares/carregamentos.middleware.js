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

export const validarCarregamentoInput = (req, res, next) => {
    // 1. Validação de segurança: Body vazio
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(validationError({ 
            geral: ["O corpo do pedido está vazio. Campos necessários: id_veiculo, id_vaga, data_hora_inicio, data_hora_fim."] 
        }));
    }

    const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim } = req.body;
    const errors = {};

    // 2. Validação individual dos campos obrigatórios
    if (!id_veiculo) errors.id_veiculo = ["O id_veiculo é obrigatório."];
    if (!id_vaga) errors.id_vaga = ["O id_vaga é obrigatório."];
    if (!data_hora_inicio) errors.data_hora_inicio = ["A data_hora_inicio é obrigatória."];
    if (!data_hora_fim) errors.data_hora_fim = ["A data_hora_fim é obrigatória."];

    // 3. Validação de lógica de datas
    if (data_hora_inicio && data_hora_fim) {
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            errors.datas = ["Formato de data inválido. Use o formato ISO (YYYY-MM-DDTHH:mm:ssZ)."];
        } else if (fim <= inicio) {
            errors.data_hora_fim = ["A data_hora_fim deve ser posterior à data_hora_inicio."];
        } else {
            // Validação extra: Previne carregamentos retroativos (opcional mas recomendado)
            const agora = new Date();
            if (inicio < agora && Math.abs(inicio - agora) > 60000) { // Tolerância de 1 min
                errors.data_hora_inicio = ["A data de início não pode ser no passado."];
            }
        }
    }

    // 4. Se houver erros, retorna a estrutura consistente
    if (Object.keys(errors).length > 0) {
        return next(validationError(errors));
    }

    next();
};