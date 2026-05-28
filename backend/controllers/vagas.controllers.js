import { Vaga } from '../models/db.config.js';
import { validationError, genericError } from '../utils/error.utils.js';

// 1. Listar vagas
export const listarVagas = async (req, res, next) => {
    try {
        const { estado } = req.query;
        // Erro 400: Garante que se o filtro "estado" for enviado, só aceita os valores corretos
        if (estado !== undefined && estado !== 'true' && estado !== 'false' && estado !== '0' && estado !== '1') {
            const error = validationError("O valor do filtro 'estado' deve ser booleano (true/false) ou numérico (0/1).");
            error.status = 400;
            return next(error);
        }

        let condicoes = {};

        //0 = Vaga Livre / 1 = Vaga Ocupada
        if (estado === 'true' || estado === '0') {
            condicoes.estado = 0; // Utilizador quer ver as livres
        } else if (estado === 'false' || estado === '1') {
            condicoes.estado = 1; // Utilizador quer ver as ocupadas
        }

        // Procura as vagas na base de dados com as condições definidas 
        const vagas = await Vaga.findAll({ where: condicoes });

        // Erro 404: Se a base de dados não devolver nenhuma vaga que corresponda ao filtro
        if (!vagas || vagas.length === 0) {
            const error = new Error("Não foram encontradas vagas para o estado solicitado.");
            error.status = 404;
            return next(error);
        }

        // Conta o número de vagas livres na lista retornada (mesmo que o filtro seja para vagas ocupadas, queremos mostrar quantas estão livres)
        const totalLivres = condicoes.estado === 1 
            ? 0 
            : vagas.filter(v => v.estado === 0).length;

        // Resposta de Sucesso 200 OK
        return res.status(200).json({
            status: "sucesso",
            total_vagas_retornadas: vagas.length,
            total_vagas_livres_na_lista: totalLivres,
            dados: vagas
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};
//-----------------------------------------------ADMIN-------------------------------------------------------------------
// 2. Criar vaga
export const criarVaga = async (req, res, next) => {
    try {
        const { andar, cor, letra, tipo_vaga } = req.body;

        // Erro 400: Validação de campos obrigatórios
        if (!andar || !cor || !letra || !tipo_vaga) {
            const error = validationError("Os campos andar, cor, letra e tipo_vaga são obrigatórios.");
            error.status = 400;
            return next(error);
        }
        // Verificar se já existe uma vaga no mesmo andar com a mesma letra
        const vagaDuplicada = await Vaga.findOne({ where: { andar, cor, letra, tipo_vaga } });

        // Erro 409: Conflito se a vaga já existir
        if (vagaDuplicada) {
            const error = validationError(`A vaga com a letra '${letra}' na cor '${cor}' no andar ${andar} com o tipo '${tipo_vaga}' já está registada.`);
            error.status = 409;
            return next(error);
        }

        //Criar a vaga na Base de Dados
        const novaVaga = await Vaga.create({
            andar,
            cor,
            letra,
            tipo: tipo || "normal", //normal ou elétrico
            estado: 0 // Toda a vaga nova começa como 0 (Livre)
        });

        return res.status(201).json({
            status: "sucesso",
            mensagem: "Nova vaga adicionada ao parque com sucesso!",
            dados: novaVaga
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};

// 3. Atualizar os dados ou o estado de uma vaga existente
export const atualizarVagaAdmin = async (req, res, next) => {
    try {
        const { id_vaga } = req.params;
        const { andar, letra, tipo, estado } = req.body;

        // Erro 400: Garantir que o ID veio no URL
        if (!id_vaga) {
            const error = validationError("O ID da vaga é obrigatório no URL.");
            error.status = 400;
            return next(error);
        }

        // Verificar se a vaga existe antes de tentar atualizar
        const vaga = await Vaga.findByPk(id_vaga);

        // Erro 404: Se a vaga não for encontrada
        if (!vaga) {
            const error = new Error(`A vaga com o ID ${id_vaga} não existe.`);
            error.status = 404;
            return next(error);
        }

        //Atualizar os dados da vaga na Base de Dados
        await Vaga.update(
            { andar, letra, tipo, estado },
            { where: { id_vaga: parseInt(id_vaga) } }
        );

        return res.status(200).json({
            status: "sucesso",
            mensagem: `Vaga ID ${id_vaga} atualizada com sucesso pelo administrador.`
        });

    } catch (error) {
        return next(genericError(error.message));
    }
};