import { Reserva, Vaga, Veiculo } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Criação da reserva
export const reservar = async (req, res, next) => {
    try {
        const id_utilizador = req.userId; // Vem do Token JWT
        const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim, valor } = req.body;

        // Erro 400: Validação de campos obrigatórios
        if (!id_veiculo || !id_vaga || !data_hora_inicio || !data_hora_fim || !valor) {
            const error = validationError("Todos os campos (id_veiculo, id_vaga, data_hora_inicio, data_hora_fim, valor) são obrigatórios.");
            error.status = 400;
            return next(error);
        }

        // Erro 422: Validar se a hora de fim é posterior à hora de início
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);

        if (fim <= inicio) {
            const error = validationError("A hora de fim deve ser posterior à hora de início.");
            error.status = 422;
            return next(error);
        }

        // Vai procurar se a vaga e o veículo existem na base de dados
        const vagaExistente = await Vaga.findByPk(id_vaga);
        const veiculoExistente = await Veiculo.findByPk(id_veiculo);

        // Erro 404: Se a vaga ou o veículo não existirem na base de dados
        if (!vagaExistente || !veiculoExistente) {
            const error = validationError("Erro de referência: Verifique se a vaga e o veículo existem de facto.");
            error.status = 404;
            return next(error);
        }

        // Erro 403: Verificar se o veículo pertence ao utilizador logado
        if (veiculoExistente.id_utilizador !== id_utilizador) {
            const error = validationError("O veículo selecionado não está associado à sua conta.");
            error.status = 403;
            return next(error);
        }

        // Erro 409: Verificar se a vaga já está ocupada/reservada (estado = 1)
        if (vagaExistente.estado === 1) {
            const error = validationError("A vaga selecionada já se encontra ocupada ou reservada para o horário pretendido.");
            error.status = 409;
            return next(error);
        }

        //Cria o registo na tabela Reserva
        const novaReserva = await Reserva.create({
            id_utilizador,
            id_veiculo,
            id_vaga,
            data_hora_inicio,
            data_hora_fim,
            valor,
            pago: 0 // Começa a 0 (não pago) e só muda para 1 quando o utilizador finalizar o carregamento e pagar a reserva
        });

        //Atualiza o estado da vaga para ocupada (estado:1) (estado:0 = livre)
        await Vaga.update({ estado: 1 }, { where: { id_vaga } });

        // Sucess response
        return res.status(201).json({
            status: "sucesso",
            mensagem: "Reserva efetuada com sucesso!",
            dados: novaReserva
        });
        
    } catch (error) {
        return next(genericError(error.message));
    }
};

// 2. Histórico do utilizador (Ver reservas)
export const verReservas = async (req, res, next) => {
    try {
        const id_url = req.params.id; // O ID que vem na rota 
        const id_autenticado = req.userId; // O ID que vem do Token
        const tipo_utilizador = req.userTipo; // Se é cliente ou admin
        
        // Erro 403: Um cliente comum não pode ver as reservas de outro utilizador
        if (parseInt(id_url) !== id_autenticado && tipo_utilizador !== 'admin') {
            const error = validationError("Não tens permissão para aceder às reservas deste utilizador.");
            error.status = 403;
            return next(error);
        }

        // Procurar todas as reservas pertencentes a esse ID de utilizador
        const reservas = await Reserva.findAll({
            where: { id_utilizador: id_url },
            include: [
                { model: Veiculo, attributes: ['matricula', 'tipo_combustivel'] },
                { model: Vaga, attributes: ['andar', 'cor', 'letra', 'tipo_vaga', 'estado'] } //o tipo_vaga é considerado o tipo de veiculo, ou seja, se é a combustao ou eletrico 
            ]
        });

        // Erro 404: Se o utilizador não tiver nenhuma reserva efetuada
        if (!reservas || reservas.length === 0) {
            const error = new Error("Este utilizador ainda não efetuou qualquer reserva.");
            error.status = 404;
            return next(error);
        }
        
        // Resposta de Sucesso
        return res.status(200).json({
            status: "sucesso",
            total_registos: reservas.length,
            dados: reservas
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

// 3. Cancelar reserva
export const cancelarReserva = async (req, res, next) => {
    try {
        const { id_reserva } = req.params;
        const id_autenticado = req.userId; // ID vindo do teu Token
        const tipo_utilizador = req.userTipo; // Se é cliente ou admin

        // Procurar se a reserva de facto existe
        const reserva = await Reserva.findByPk(id_reserva);

        // Erro 404: Reserva não existe
        if (!reserva) {
            const error = validationError("A reserva especificada não foi encontrada.");
            error.status = 404;
            return next(error);
        }

        // Erro 403: Um cliente comum não pode apagar a reserva de outrem
        if (reserva.id_utilizador !== id_autenticado && tipo_utilizador !== 'admin') {
            const error = validationError("Não tens permissão para cancelar esta reserva.");
            error.status = 403;
            return next(error);
        }

        //Liberta a vaga associada antes de apagar a reserva (colocar estado a 0 = livre)
        await Vaga.update({ estado: 0 }, { where: { id_vaga: reserva.id_vaga } });

        //Apaga o registo da reserva da base de dados
        await reserva.destroy();

        //Sucess response
        return res.status(200).json({ 
            status: "sucesso",
            mensagem: "Reserva cancelada e vaga libertada com sucesso." 
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};
//------------------------------------------------ADMIN-------------------------------------------------------------------
// 4. Listar todas as reservas de todos os utilizadores (Admin)
export const listarTodasReservas = async (req, res, next) => {
    try {
        const todasReservas = await Reserva.findAll({
            include: [
                { model: Veiculo, attributes: ['matricula', 'tipo_combustivel'] },
                { model: Vaga, attributes: ['andar', 'cor', 'letra', 'tipo_vaga', 'estado'] }
            ]
        });

        // Erro 404: Se não houver nenhuma reserva em todo o sistema
        if (!todasReservas || todasReservas.length === 0) {
            const error = new Error("Não existem registos de reservas no sistema.");
            error.status = 404;
            return next(error);
        }

        return res.status(200).json({
            status: "sucesso",
            total_registos: todasReservas.length,
            dados: todasReservas
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};
// 5. Cancelar e apagar QUALQUER reserva por ID
export const apagarReservaAdmin = async (req, res, next) => {
    try {
        const { id_reserva } = req.params;

        // Erro 400: Validação de ID ausente no URL
        if (!id_reserva) {
            const error = validationError("O ID da reserva é obrigatório no URL.");
            error.status = 400;
            return next(error);
        }

        // Verificar se a reserva existe de facto antes de apagar
        const reserva = await Reserva.findByPk(id_reserva);
        
        // Erro 404: Se a reserva não existir
        if (!reserva) {
            const error = new Error(`A reserva com o ID ${id_reserva} não foi encontrada.`);
            error.status = 404;
            return next(error);
        }

        //Liberta a vaga associada (coloca o estado a 0 = livre)
        await Vaga.update({ estado: 0 }, { where: { id_vaga: reserva.id_vaga } });

        //Elimina o registo da reserva da base de dados
        await reserva.destroy();

        return res.status(200).json({
            status: "sucesso",
            mensagem: `A reserva número ${id_reserva} foi cancelada e eliminada com sucesso pelo administrador.`
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};