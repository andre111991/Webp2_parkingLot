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

export const updateVeiculo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { matricula, tipo_combustivel } = req.body;

        // O middleware verificarDonoVeiculo já garantiu que o veículo existe 
        // e pertence ao utilizador. Agora fazemos o update.
        const [updatedRows] = await Veiculo.update(
            { matricula, tipo_combustivel },
            { where: { id_veiculo: id } }
        );

        if (updatedRows === 0) {
            return res.status(400).json({ message: "Nenhuma alteração efetuada." });
        }

        res.status(200).json({ message: "Veículo atualizado com sucesso!" });
    } catch (error) {
        next(error);
    }
};

export const deleteVeiculo = async (req, res, next) => {
    try {
        const { id } = req.params;

        // O middleware já verificou se o veículo existe e se pertence ao utilizador
        const deletedRows = await Veiculo.destroy({
            where: { id_veiculo: id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: "Veículo não encontrado." });
        }

        res.status(200).json({ message: "Veículo eliminado com sucesso!" });
    } catch (error) {
        next(error);
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

// mesma funçao do deleteVeiculo, mas sem verificar se o dono é o req.user.id, porque o admin pode apagar qualquer veículo e a msg de sucesso e diferente 
export const adminDeleteVeiculo = async (req, res, next) => {
    try {
        const { id } = req.params;

        // O admin apaga pelo ID, sem verificar se o dono é o req.user.id
        const deletedRows = await Veiculo.destroy({
            where: { id_veiculo: id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: "Veículo não encontrado." });
        }

        res.status(200).json({ message: "Veículo eliminado pelo Administrador com sucesso!" });
    } catch (error) {
        next(error);
    }
};

