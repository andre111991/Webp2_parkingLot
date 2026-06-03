import { Reserva, Vaga, Veiculo, User } from '../models/db.config.js'; 
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

export const listarMinhasReservas = async (req, res, next) => {
    try {
        const id_utilizador = req.user.id;

        const reservas = await Reserva.findAll({
            where: { id_utilizador: id_utilizador },
            include: [
                { 
                    model: Veiculo, 
                    attributes: ['matricula', 'tipo_combustivel'] 
                },
                { 
                    model: Vaga, 
                    attributes: ['andar', 'cor', 'letra', 'tipo', 'estado', 'potencia'] 
                }
            ],
            order: [['data_hora_inicio', 'DESC']]
        });

        // Verificação: Se o array estiver vazio, retorna a mensagem
        if (reservas.length === 0) {
            return res.status(200).json({ 
                message: "Não tens reservas feitas até ao momento." 
            });
        }

        res.status(200).json(reservas);
    } catch (error) {
        next(error);
    }
};

export const getReservasPorUtilizador = async (req, res, next) => {
    try {
        const { id_utilizador } = req.params; 

        // 1. Validação de existência do utilizador usando o modelo 'User'
        const utilizador = await User.findByPk(id_utilizador);
        
        if (!utilizador) {
            return next(notFoundError("Utilizador"));
        }

        // 2. Busca de reservas
        const reservas = await Reserva.findAll({
            where: { id_utilizador: id_utilizador },
            include: [
                { 
                    model: Veiculo, 
                    attributes: ['matricula', 'tipo_combustivel'] 
                },
                { 
                    model: Vaga, 
                    attributes: ['andar', 'cor', 'letra', 'tipo', 'estado', 'potencia'] 
                }
            ],
            order: [['data_hora_inicio', 'DESC']]
        });

        // 3. Validação de histórico vazio
        if (reservas.length === 0) {
            return res.status(200).json({ 
                message: "Este utilizador não tem reservas feitas até ao momento." 
            });
        }

        res.status(200).json(reservas);
        
    } catch (error) {
        next(error);
    }
};

export const cancelarReservaAdmin = async (req, res, next) => {
    try {
        const { id_reserva } = req.params;

        // 1. Validar se quem faz o pedido é Admin
        if (req.user.role !== 'admin') {
            return next(validationError({ message: "Acesso negado. Apenas administradores podem cancelar reservas." }));
        }

        // 2. Encontrar a reserva
        const reserva = await Reserva.findByPk(id_reserva);
        if (!reserva) {
            return next(notFoundError("Reserva"));
        }

        // 3. Libertar a vaga (mudar estado para 0)
        const vaga = await Vaga.findByPk(reserva.id_vaga);
        if (vaga) {
            await vaga.update({ estado: 0 });
        }

        // 4. Forçar o cancelamento (Apagar da base de dados)
        await reserva.destroy();

        res.status(200).json({ message: "Reserva cancelada com sucesso e vaga libertada." });

    } catch (error) {
        next(error);
    }
};

export const marcarComoPago = async (req, res, next) => {
    try {
        const { id_reserva } = req.params;

        // 2. Encontrar a reserva
        const reserva = await Reserva.findByPk(id_reserva);
        if (!reserva) {
            return next(notFoundError("Reserva"));
        }

        // 3. Alterar o estado do pagamento para 1
        await reserva.update({ 
            pago: 1,
            data_pagamento: new Date() // Opcional: regista a data atual como data de pagamento
        });

        res.status(200).json({ 
            message: "Reserva marcada como paga com sucesso.",
            reserva_atualizada: reserva 
        });

    } catch (error) {
        next(error);
    }
};