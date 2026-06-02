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

export const getVagaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vaga = await Vaga.findByPk(id);

        if (!vaga) {
            return res.status(404).json({ message: "Vaga não encontrada." });
        }

        res.status(200).json(vaga);
    } catch (error) {
        next(error);
    }
};

//-----------------------------------------------ADMIN-------------------------------------------------------------------

export const createVaga = async (req, res, next) => {
    try {
        const { andar, cor, tipo, potencia } = req.body;

        // 1. Validação de campos comuns
        if (!andar || !cor || !tipo) {
            return res.status(400).json({ message: "Campos obrigatórios em falta (andar, cor, tipo)." });
        }

        // 2. Validação rigorosa para Elétricos
        if (tipo === 'eletrico' && (potencia === undefined || potencia === null || potencia === "")) {
            return res.status(400).json({ 
                message: "Vagas elétricas requerem obrigatoriamente um valor de potência." 
            });
        }

        // 3. Buscar o último ID para gerar a letra
        const ultimaVaga = await Vaga.findOne({
            order: [['id_vaga', 'DESC']]
        });

        let nextIndex = ultimaVaga ? ultimaVaga.id_vaga : 0;

        const gerarIdentificador = (index) => {
            const primeira = String.fromCharCode(65 + Math.floor(index / 26));
            const segunda = String.fromCharCode(65 + (index % 26));
            return `${primeira}${segunda}`;
        };

        // 4. Criação
        const novaVaga = await Vaga.create({
            andar,
            cor,
            letra: gerarIdentificador(nextIndex),
            tipo,
            potencia: tipo === 'eletrico' ? potencia : null,
            estado: '0'
        });

        res.status(201).json({ message: "Vaga criada com sucesso!", vaga: novaVaga });
    } catch (error) {
        next(error);
    }
};

export const updateVaga = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // CORREÇÃO: Se req.body for null ou undefined, torna-o num objeto vazio
        const dadosParaAtualizar = req.body || {};

        // 1. Validar se o objeto está vazio
        if (Object.keys(dadosParaAtualizar).length === 0) {
            return res.status(400).json({ message: "O corpo do pedido não pode estar vazio." });
        }

        // 2. Verificar se a vaga existe
        const vaga = await Vaga.findByPk(id);
        if (!vaga) {
            return res.status(404).json({ message: "Vaga não encontrada." });
        }

        // 3. Validação de segurança para potência
        const novoTipo = dadosParaAtualizar.tipo !== undefined ? dadosParaAtualizar.tipo : vaga.tipo;
        const novaPotencia = dadosParaAtualizar.potencia !== undefined ? dadosParaAtualizar.potencia : vaga.potencia;

        if (novoTipo === 'eletrico' && (novaPotencia === null || novaPotencia === '')) {
            return res.status(400).json({ message: "Vagas elétricas devem ter uma potência definida." });
        }

        // 4. Atualizar os campos
        await vaga.update(dadosParaAtualizar);

        res.status(200).json({ 
            message: "Vaga atualizada com sucesso!", 
            vaga 
        });

    } catch (error) {
        next(error);
    }
};

export const deleteVaga = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Procurar a vaga antes de apagar
        const vaga = await Vaga.findByPk(id);

        if (!vaga) {
            return res.status(404).json({ message: "Vaga não encontrada." });
        }

        // 2. Verificar se a vaga está reservada (opcional, mas recomendado)
        // Se o estado for '1', significa que está ocupada. 
        // Normalmente não queremos apagar vagas que estão em uso!
        if (vaga.estado === '1') {
            return res.status(400).json({ 
                message: "Não é possível apagar uma vaga que está atualmente ocupada." 
            });
        }

        // 3. Apagar a vaga
        await vaga.destroy();

        res.status(200).json({ message: "Vaga apagada com sucesso!" });
    } catch (error) {
        next(error);
    }
};