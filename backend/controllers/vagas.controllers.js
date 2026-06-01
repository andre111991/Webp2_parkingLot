import { Vaga } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';


export const getAllVagas = async (req, res, next) => {
    try {
        // Busca todas as vagas e ordena pela letra (A-Z) para aparecerem organizadas
        const vagas = await Vaga.findAll({
            order: [['letra', 'ASC']]
        });

        // Retorna a lista completa para o frontend
        res.status(200).json(vagas);
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

//-----------------------------------------------ADMIN-------------------------------------------------------------------


