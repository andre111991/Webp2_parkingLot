import { Vaga } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Listar vagas
export const ListarVagas = async (req, res, next) => {
    try {
        const { estado } = req.query; 
        let filtro = {};

        if (estado === 'true') {
            filtro = { where: { estado: 0 } }; // 0 = Livre
        }

        const vagas = await Vaga.findAll(filtro);

        res.status(200).json({
            status: "sucesso",
            codigo: 200,
        });

        //Error responses: 503 Service Unavailable
        const sistemaDisponivel = true; // Alterar para false para testar o erro 503
        if (!sistemaDisponivel) {
            const error = validationError("Sistema de monitorização de vagas temporariamente indisponível.");
            error.status = 503; //
            return next(error);
        }

        
        // Error responses: 400 Bad Request
        // Garante que o filtro "estado" só aceita: true, false, 0 ou 1
        if (estado !== undefined && estado !== 'true' && estado !== 'false' && estado !== '0' && estado !== '1') {
            const error = validationError("O valor do filtro 'estado' deve ser booleano (true/false) ou numérico (0/1).");
            error.status = 400; //
            return next(error);
        }

        let condicoes = {};

        // 0 = vagas LIVRES
        if (estado === 'true' || estado === '0') {
            condicoes.estado = 0;
        } 
        // 1 = vagas OCUPADAS
        else if (estado === 'false' || estado === '1') {
            condicoes.estado = 1;
        }

        const vagas = await Vaga.findAll({ where: condicoes });

        res.status(200).json({
            status: "sucesso",
            total_vagas_livres: condicoes.estado === 1 ? 0 : vagas.length, 
            dados: vagas
        });

    } catch (error) {
        next(genericError(error.message));
    }
};