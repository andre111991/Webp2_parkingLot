import {Reserva,Vaga,Veiculo }  from '../models/db.config.js';
import { notFoundError, validationError } from '../utils/error.utils.js';
import { Op } from 'sequelize';

export const criarReserva = async (req, res, next) => {
    try {
        const id_veiculo = parseInt(req.body.id_veiculo);
        const id_vaga = parseInt(req.body.id_vaga);
        const { data_hora_inicio, data_hora_fim } = req.body;
        const id_utilizador = req.user.id;

        // 1. Carregar Vaga e Veículo
        const vaga = await Vaga.findByPk(id_vaga);
        const veiculo = await Veiculo.findByPk(id_veiculo);

        if (!vaga) return next(notFoundError("Vaga"));
        if (!veiculo) return next(notFoundError("Veículo"));

        // 2. Validação de compatibilidade (Eletrico/Combustão)
        // Nota: Certifica-te que os teus campos na BD têm os mesmos valores (ex: 'eletrico')
        if (vaga.tipo !== veiculo.tipo_combustivel) {
            return next(validationError({ 
                compatibilidade: [`Não podes estacionar um veículo ${veiculo.tipo_combustivel} numa vaga ${vaga.tipo}.`] 
            }));
        }

        // 3. Validação de estado da vaga
        if (Number(vaga.estado) !== 0) {
            return next(validationError({ vaga: ["Esta vaga já está ocupada."] }));
        }

        // 4. Validação de sobreposição (Mesmo veículo)
        const reservaSobreposta = await Reserva.findOne({
            where: {
                id_veiculo: id_veiculo,
                [Op.or]: [
                    { data_hora_inicio: { [Op.between]: [data_hora_inicio, data_hora_fim] } },
                    { data_hora_fim: { [Op.between]: [data_hora_inicio, data_hora_fim] } }
                ]
            }
        });

        if (reservaSobreposta) {
            return next(validationError({ veiculo: ["Este veículo já tem uma reserva ativa neste período."] }));
        }

        // 5. Cálculo de valor
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);
        
        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            return next(validationError({ datas: ["Formato de data inválido."] }));
        }

        const diffHoras = (fim - inicio) / (1000 * 60 * 60);
        const valorCalculado = Math.max(0, diffHoras * 1.5);

        // 6. Criar reserva
        const novaReserva = await Reserva.create({
            id_utilizador,
            id_veiculo,
            id_vaga,
            data_hora_inicio,
            data_hora_fim,
            valor: parseFloat(valorCalculado.toFixed(2)),
            pago: 0,
            data_pagamento: null
        });

        // 7. Bloquear a vaga
        await vaga.update({ estado: 1 });

        res.status(201).json(novaReserva);
    } catch (error) {
        next(error); 
    }
}