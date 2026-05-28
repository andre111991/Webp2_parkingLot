import { Veiculo } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Adicionar um novo veículo (Cliente)
export const addVeiculo = async (req, res, next) => {
    try {
        // CORREÇÃO 1: Aceder ao ID via req.user.id (como definido no middleware)
        const id_utilizador = req.user.id; 
        
        // CORREÇÃO 2: Extrair também marca e modelo do req.body
        const { matricula, tipo_combustivel } = req.body;

        

        const veiculoDuplicado = await Veiculo.findOne({ where: { matricula } });
        if (veiculoDuplicado) {
            const error = validationError(`A matrícula ${matricula} já se encontra registada.`);
            error.status = 409;
            return next(error);
        }

        const novoVeiculo = await Veiculo.create({
            matricula, 
            tipo_combustivel, 
            id_utilizador // Agora o id_utilizador tem um valor real!
        });

        return res.status(201).json({
            status: "sucesso",
            mensagem: "Veículo registado com sucesso!",
            dados: novoVeiculo
        });
    } catch (error) {
        // DICA: Faz um console.log aqui para veres exatamente o erro no terminal!
        console.log("Erro ao criar veiculo:", error); 
        return next(genericError(error.message));
    }
};

// 2. Listar APENAS os veículos do cliente logado
export const getVeiculosCliente = async (req, res, next) => {
    try {
        const id_autenticado = req.userId;

        // O cliente só vê os seus próprios carros
        const veiculos = await Veiculo.findAll({ where: { id_utilizador: id_autenticado } });

        if (!veiculos || veiculos.length === 0) {
            const error = new Error("Ainda não tens nenhum veículo registado.");
            error.status = 404;
            return next(error);
        }

        return res.status(200).json({
            status: "sucesso",
            total: veiculos.length,
            dados: veiculos
        });
    } catch (error) {
        return next(genericError(error.message));
    }
};

// 3. Obter um veículo específico do cliente (com validação de dono)
export const getVeiculoByIdCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const id_autenticado = req.userId;

        const veiculo = await Veiculo.findByPk(parseInt(id));

        if (!veiculo) {
            const error = new Error(`O veículo com o ID ${id} não existe.`);
            error.status = 404;
            return next(error);
        }

        // Erro 403: Se o carro não for do cliente logado
        if (veiculo.id_utilizador !== id_autenticado) {
            const error = validationError("Não tens permissão para aceder a este veículo.");
            error.status = 403;
            return next(error);
        }

        return res.status(200).json({ status: "sucesso", dados: veiculo });
    } catch (error) {
        return next(genericError(error.message));
    }
};

// 4. Atualizar o veículo do próprio cliente
export const updateVeiculoCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const id_autenticado = req.userId;
        const { matricula, marca, modelo, tipo_combustivel } = req.body;

        const veiculo = await Veiculo.findByPk(parseInt(id));

        if (!veiculo) {
            const error = new Error(`O veículo com o ID ${id} não foi encontrado.`);
            error.status = 404;
            return next(error);
        }

        if (veiculo.id_utilizador !== id_autenticado) {
            const error = validationError("Não tens permissão para atualizar este veículo.");
            error.status = 403;
            return next(error);
        }

        await Veiculo.update(
            { matricula, marca, modelo, tipo_combustivel },
            { where: { id_veiculo: parseInt(id) } }
        );

        return res.status(200).json({ status: "sucesso", mensagem: "Veículo atualizado com sucesso." });
    } catch (error) {
        return next(genericError(error.message));
    }
};

// 5. Eliminar o veículo do próprio cliente
export const deleteVeiculoCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const id_autenticado = req.userId;

        const veiculo = await Veiculo.findByPk(parseInt(id));

        if (!veiculo) {
            const error = new Error(`O veículo com o ID ${id} não foi encontrado.`);
            error.status = 404;
            return next(error);
        }

        if (veiculo.id_utilizador !== id_autenticado) {
            const error = validationError("Não tens permissão para eliminar este veículo.");
            error.status = 403;
            return next(error);
        }

        await veiculo.destroy();
        return res.status(200).json({ status: "sucesso", mensagem: "Veículo removido com sucesso." });
    } catch (error) {
        return next(genericError(error.message));
    }
};

//-------------------------------------------------------------------------Admin-------------------------------------------------------------------------
// 6.Listar ABSOLUTAMENTE TODOS os veículos do parque
export const getAllVeiculosAdmin = async (req, res, next) => {
    try {
        const todosVeiculos = await Veiculo.findAll();

        if (!todosVeiculos || todosVeiculos.length === 0) {
            const error = new Error("Não existem veículos registados no sistema.");
            error.status = 404;
            return next(error);
        }

        return res.status(200).json({
            status: "sucesso",
            total: todosVeiculos.length,
            dados: todosVeiculos
        });
    } catch (error) {
        return next(genericError(error.message));
    }
};

// 7.Eliminar QUALQUER veículo do sistema à força
export const deleteVeiculoAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const veiculo = await Veiculo.findByPk(parseInt(id));
        if (!veiculo) {
            const error = new Error(`O veículo com o ID ${id} não foi encontrado.`);
            error.status = 404;
            return next(error);
        }

        await veiculo.destroy();
        return res.status(200).json({
            status: "sucesso",
            mensagem: `O veículo ID ${id} foi eliminado do sistema pelo administrador.`
        });
    } catch (error) {
        return next(genericError(error.message));
    }
};