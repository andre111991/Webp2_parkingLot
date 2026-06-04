import { Carregamento, Veiculo, Vaga } from '../models/db.config.js';
import { notFoundError, validationError } from '../utils/error.utils.js';

import { Carregamento, Veiculo, Vaga } from '../models/db.config.js';
import { notFoundError, validationError } from '../utils/error.utils.js';

export const iniciarCarregamento = async (req, res, next) => {
    try {
        const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim } = req.body;

        // 1. Busca dos dados (O middleware já validou a existência, mas mantemos para segurança)
        const vaga = await Vaga.findByPk(id_vaga);
        const veiculo = await Veiculo.findByPk(id_veiculo);

        // 2. Validação de disponibilidade da vaga (Estado 0 = Livre)
        if (vaga.estado !== 0) {
            return next(validationError({ message: "Esta vaga encontra-se ocupada no momento." }));
        }

        // 3. Validação e Cálculo de tempo
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);
        const diffHoras = (fim - inicio) / (1000 * 60 * 60);

        if (diffHoras <= 0) {
            return next(validationError({ message: "A data de fim deve ser posterior à de início." }));
        }

        // 4. Cálculo do custo (Preço fixo 0.30€/kWh * potência da vaga)
        const taxaKwh = 0.30;
        const valorFinal = vaga.potencia * diffHoras * taxaKwh;

        // 5. Criar registo na base de dados
        const novoCarregamento = await Carregamento.create({
            id_veiculo,
            id_vaga,
            data_hora_inicio: inicio,
            data_hora_fim: fim,
            pago: 0,
            valor: parseFloat(valorFinal.toFixed(2)) // Converte para float para a BD
        });

        // 6. Atualizar estado da vaga para 1 (Ocupada)
        await vaga.update({ estado: 1 });

        res.status(201).json({
            message: "Carregamento iniciado com sucesso.",
            valor_calculado: novoCarregamento.valor,
            carregamento: novoCarregamento
        });

    } catch (error) {
        next(error);
    }
};