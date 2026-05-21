
import { Reserva, Vaga, Veiculo } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

//1. Criação da reserva
export const Reservar = async (req, res, next) => {
    try {
        const id_utilizador = req.userId; // Vem do Token JWT
        const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim, valor } = req.body; //Add data_pagamento?


        // Criar o registo na tabela Reserva
        const novaReserva = await Reserva.create({
            id_utilizador,
            id_veiculo,
            id_vaga,
            data_hora_inicio,
            data_hora_fim,
            data_pagamento, // Será que é necessario estar na tabela?
            valor,
            pago: 0 // Começa a 0 (não pago)
        });

        // Caso a vaga nao exitir
        if (!vaga) {
            return next(validationError("A vaga selecionada não existe."));
        }

        // Estado=0 -> vaga livre, estado=1 -> vaga ocupada
        if (vaga.estado === 1) {
            return next(validationError("Esta vaga já se encontra ocupada ou reservada por outro utilizador."));
        }

        await Vaga.update({ estado: 1 }, { where: { id_vaga } });
        //Sucess response
        res.status(201).json({
            message: "Reserva efetuada com sucesso!",
            reserva: novaReserva
        });
        
    } catch (error) {
        next(genericError(error.message));
    }

        // Error responses: 409 Conflict
        // A vaga selecionada já está ocupada (estado = 1)
        if (vagaExistente.estado === 1) {
            const error = conflictError("A vaga selecionada já não está disponível para o horário pretendido.");
            error.status = 409;
            return next(error);
        }

         // Error responses: 403 Forbidden
        // O veículo selecionado não está associado à conta do utilizador logado
        if (veiculoExistente.id_utilizador !== id_utilizador) {
            const error = validationError("O veículo selecionado não está associado à sua conta.");
            error.status = 403;
            return next(error);
        }

        // Error responses: 422 Unprocessable Entity
        // Dados inválidos (ex: hora de fim anterior ao início)
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);

        if (fim <= inicio) {
            const error = validationError("A hora de fim deve ser posterior à hora de início.");
            error.status = 422;
            error.errors = { data_hora_fim: "A hora de fim deve ser posterior à hora de início." };
            return next(error);
        }

        // Error responses: 400 Bad Request
        // Verifica se a vaga e o veículo existem
        const vagaExistente = await Vaga.findByPk(id_vaga);
        const veiculoExistente = await Veiculo.findByPk(id_veiculo);

        if (!vagaExistente || !veiculoExistente) {
            const error = validationError("Erro de referência: Verifique se a vaga e o veículo existem.");
            error.status = 400;
            return next(error);
        }

};

//2. Histórico do utilizador
export const VerReservas = async (req, res, next) => {
    try {
        const id_url = req.params.id; // O ID que vem na rota /:id
        const id_autenticado = req.userId; // O ID que vem do Token
        const tipo_utilizador = req.userTipo; // Se é cliente ou admin
        
        // Error responses: 403 Forbidden
        // Um cliente comum não pode ver as reservas de outro ID
       if (id_url != id_autenticado && tipo_utilizador !== 'admin') 
        {
            const error = validationError("Não tens permissão para aceder às reservas deste utilizador.");
            error.status = 403;
            return next(error);
        }

        // Procura todas as reservas pertencentes a esse ID de utilizador
        const reservas = await Reserva.findAll({
            where: { id_utilizador: id_url },
            include: [
                { model: Veiculo, attributes: ['matricula', 'tipo_combustivel'] },
                { model: Vaga, attributes: ['andar', 'letra'] }
            ]
        });
        //Success response
        
        res.status(200).json({
            status: "sucesso",
            codigo: 200,
            reservas: reservas
         });

    } catch (error) {
        next(genericError(error.message));
    }
};

//3. Cancelar reserva
export const CancelarReserva = async (req, res, next) => {
    try {
        const { id_reserva } = req.params;
        const id_autenticado = req.userId; // ID vindo do teu Token
        const tipo_utilizador = req.userTipo; // Se é cliente ou admin

        const reserva = await Reserva.findByPk(id_reserva);

        // Error responses: 404 Not Found
        // Reserva não existe
        if (!reserva) {
            const error = validationError("Reserva não encontrada.");
            error.status = 404;
            return next(error);
        }

        // Error responses: 403 Forbidden
        // Um cliente comum não pode apagar a reserva de outro utilizador
        if (reserva.id_utilizador !== id_autenticado && tipo_utilizador !== 'admin') {
            const error = validationError("Não tem permissão para cancelar esta reserva.");
            error.status = 403;
            return next(error);
        }

        // Liberta a vaga associada antes de apagar a reserva (colocar estado a 0 = livre)
        await Vaga.update({ estado: 0 }, { where: { id_vaga: reserva.id_vaga } });

        // Apaga o registo da reserva
        await reserva.destroy();

        // Success response
        res.status(200).json({ 
            status: "sucesso",
            codigo: 200,
            message: "Reserva cancelada e vaga libertada com sucesso." 
        });

    } catch (error) {
        next(genericError(error.message));
    }
};