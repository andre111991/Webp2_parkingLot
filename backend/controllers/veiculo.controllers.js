import { Veiculo } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

export const addVeiculo = async (req, res, next) => {
    try {
        // Criamos o objeto com os dados do body + o ID do dono (que vem do token)
        const novoVeiculo = await Veiculo.create({
            ...req.body,
            id_utilizador: req.user.id 
        });

        res.status(201).json({ 
            message: "Veículo adicionado com sucesso!", 
            veiculo: novoVeiculo 
        });
    } catch (error) {
        next(error); // O teu middleware de erro trata o resto
    }
};

// 2. Listar APENAS os veículos do cliente logado
export const getMeusVeiculos = async (req, res, next) => {
    try {
        // req.user.id vem do teu middleware verificarToken
        const meusVeiculos = await Veiculo.findAll({
            where: { id_utilizador: req.user.id }
        });

        res.status(200).json(meusVeiculos);
    } catch (error) {
        next(genericError());
    }
};



//-------------------------------------------------------------------------Admin-------------------------------------------------------------------------
// 6.Listar ABSOLUTAMENTE TODOS os veículos do parque
export const getAllVeiculos = async (req, res, next) => {
    try {
        const veiculos = await Veiculo.findAll();

        // Agrupar por id_utilizador
        const agrupado = veiculos.reduce((acc, v) => {
            if (!acc[v.id_utilizador]) {
                acc[v.id_utilizador] = [];
            }
            acc[v.id_utilizador].push({
                id_veiculo: v.id_veiculo,
                matricula: v.matricula,
                tipo_combustivel: v.tipo_combustivel
            });
            return acc;
        }, {});

        // Formatar para o que pediste: array de objetos com id e veiculos
        const resultadoFinal = Object.keys(agrupado).map(id => ({
            id_utilizador: parseInt(id),
            Veiculos: agrupado[id]
        }));

        res.status(200).json(resultadoFinal);
    } catch (error) {
        next(error);
    }
};

