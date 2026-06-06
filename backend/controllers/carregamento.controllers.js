import { Carregamento, Veiculo, Vaga } from '../models/db.config.js';
import { notFoundError, validationError } from '../utils/error.utils.js';

export const iniciarCarregamento = async (req, res, next) => {
    try {
        const { id_veiculo, id_vaga, data_hora_inicio, data_hora_fim } = req.body;

        // 1. OBRIGATÓRIO: Carregar a vaga do banco de dados
        const vaga = await Vaga.findByPk(id_vaga);
        
        if (!vaga) return next(notFoundError("Vaga"));

        // 2. CORREÇÃO: Verifica o estado da instância "vaga"
        if (vaga.estado !== 0) {
            return next(validationError({ message: "Esta vaga encontra-se ocupada no momento." }));
        }

        // 3. Validação e Cálculo de tempo
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(data_hora_fim);
        const diffHoras = (fim - inicio) / (1000 * 60 * 60);

        if (diffHoras <= 0) {
            return next(validationError({ message: "A data de fim deve ser posterior à de início." }));
        }

        // 4. Cálculo do custo (Preço fixo 0.30€/kWh * potência da vaga)
        const taxaKwh = 0.30;
        const valorFinal = vaga.potencia * diffHoras * taxaKwh;

        // 5. Criar registo na base de dados
        const novoCarregamento = await Carregamento.create({
            id_veiculo,
            id_vaga,
            data_hora_inicio: inicio,
            data_hora_fim: fim,
            pago: 0,
            valor: parseFloat(valorFinal.toFixed(2)) // Converte para float para a BD
        });

        // 6. Atualizar estado da vaga para 1 (Ocupada)
        await vaga.update({ estado: 1 });

        res.status(201).json({
            message: "Carregamento iniciado com sucesso.",
            valor_calculado: novoCarregamento.valor,
            carregamento: novoCarregamento
        });

    } catch (error) {
        next(error);
    }
};

export const listarMeusCarregamentos = async (req, res, next) => {
    try {
        const id_utilizador = req.user.id; // Vem do token (verificarToken)

        // 1. Procura carregamentos associados aos veículos do utilizador
        const carregamentos = await Carregamento.findAll({
            include: [
                { 
                    model: Veiculo, 
                    where: { id_utilizador: id_utilizador }, // Filtra pelos veículos do utilizador
                    attributes: ['matricula', 'tipo_combustivel'] 
                },
                { 
                    model: Vaga, 
                    attributes: ['letra', 'andar', 'cor'] 
                }
            ],
            order: [['data_hora_inicio', 'DESC']] // Do mais recente para o mais antigo
        });

        // 2. Verificação de lista vazia
        if (!carregamentos || carregamentos.length === 0) {
            return res.status(200).json({ 
                message: "Ainda não efetuaste nenhum carregamento." 
            });
        }

        res.status(200).json(carregamentos);
    } catch (error) {
        next(error);
    }
};

//.................................admin..................................


export const getCarregamentosAdmin = async (req, res, next) => {
    try {
        // Agora usamos 'id' porque a tua rota é "/admin/ativos/:id"
        const {id} = req.params; 

        const carregamentos = await Carregamento.findAll({
            include: [
                { 
                    model: Veiculo, 
                    where: { id_utilizador: id }, // O id capturado da URL
                    attributes: ['matricula', 'tipo_combustivel'] 
                },
                { 
                    model: Vaga, 
                    attributes: ['letra', 'andar', 'tipo'] 
                }
            ],
            order: [['data_hora_inicio', 'DESC']]
        });

        if (carregamentos.length === 0) {
            return res.status(200).json({ 
                message: `Não foram encontrados carregamentos para o utilizador com ID ${id}.` 
            });
        }

        res.status(200).json(carregamentos);
    } catch (error) {
        next(error);
    }
};


export const cancelarCarregamentoAdmin = async (req, res, next) => {
    try {
        const { id_carregamento } = req.params;

        // 1. Encontrar o carregamento
        const carregamento = await Carregamento.findByPk(id_carregamento);
        if (!carregamento) {
            return next(notFoundError("Carregamento"));
        }

        // 2. Encontrar a vaga associada para a libertar
        const vaga = await Vaga.findByPk(carregamento.id_vaga);
        if (vaga) {
            // Liberta a vaga (volta para estado 0)
            await vaga.update({ estado: 0 });
        }

        // 3. Forçar o cancelamento (Apagar o registo)
        await carregamento.destroy();

        res.status(200).json({ 
            message: "Carregamento cancelado com sucesso e vaga libertada." 
        });

    } catch (error) {
        next(error);
    }
};

export const marcarCarregamentoComoPago = async (req, res, next) => {
    try {
        const { id_carregamento } = req.params;

        // 1. Encontrar o registo de carregamento
        const carregamento = await Carregamento.findByPk(id_carregamento);
        if (!carregamento) {
            return next(notFoundError("Carregamento"));
        }

        // 2. Alterar o estado do pagamento para 1
        await carregamento.update({ 
            pago: 1
        });

        res.status(200).json({ 
            message: "Carregamento marcado como pago com sucesso.",
            carregamento_atualizado: carregamento 
        });

    } catch (error) {
        next(error);
    }
};





