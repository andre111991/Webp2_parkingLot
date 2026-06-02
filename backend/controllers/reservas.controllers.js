import {Reserva,Vaga }  from '../models/db.config.js';
import { notFoundError, validationError } from '../utils/error.utils.js';


export const criarReserva = async (req, res, next) => {
    try {
        const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim, valor } = req.body;
        const id_utilizador = req.user.id;

        // 1. Validar se a vaga existe
        const vaga = await Vaga.findByPk(id_vaga);
        if (!vaga) {
            return next(notFoundError("Vaga")); 
        }

        // 2. Validar se a vaga está livre
        if (vaga.estado !== '0') {
            return next(validationError([{ field: "vaga", message: "Vaga ocupada ou indisponível." }]));
        }

        // 3. Validação de datas
        if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
            return next(validationError([{ field: "data", message: "Data de fim deve ser superior à de início." }]));
        }

        // 4. Criar a reserva
        const novaReserva = await Reserva.create({
            id_utilizador,
            id_veiculo,
            id_vaga,
            data_hora_inicio,
            data_hora_fim,
            valor: valor || 0.0,
            pago: 0
        });

        // 5. Bloquear a vaga
        await vaga.update({ estado: '1' });

        res.status(201).json(novaReserva);
    } catch (error) {
        next(error); 
    }
}