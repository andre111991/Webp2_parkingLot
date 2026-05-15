import { User } from '../models/db.config.js';
import bcrypt from "bcrypt"; // para encriptar a password
import {genericError, conflictError } from '../utils/error.utils.js';


export const RegisterUser = async (req, res, next) => {
    try {
        // 1. Extração dos dados (já validados pelo middleware no passo anterior)
        const { nome, email, password, tipo_utilizador } = req.body;

        // 2. Lógica de Negócio: Verificar se o email já está em uso
        // Como o email é 'unique' na DB, esta verificação evita erros de sistema e dá uma resposta clara
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = conflictError("Este email já se encontra registado.");
            return next(error);
        }

        // 3. Encriptação da Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Criação do Utilizador no Sequelize
        const newUser = await User.create({
            nome,
            email,
            password: hashedPassword,
            tipo_utilizador: tipo_utilizador || 'cliente'
        });

        // 5. Resposta de Sucesso
        res.status(201).json({
            message: "Utilizador criado com sucesso!",
            id: newUser.id_utilizador // Confirmamos que o campo no modelo é id_utilizador
        });

    } catch (error) {
        // Se o erro vier das validações do MODELO (ex: password fraca)
        // passamos a mensagem específica do Sequelize para o nosso genericError
        if (!error.status) {
            next(genericError(error.message));
        } else {    
            next(error);
        }
    }
};

export const GetUsers = async (req, res, next) => {
    try {
        // .findAll() vai buscar todos os registos na tabela
        const users = await User.findAll({
            // Opcional: escolher quais as colunas que queremos mostrar
            attributes: ['nome', 'email', 'tipo_utilizador']
        });

        // Verificamos se a lista está vazia
        if (users.length === 0) {
            return res.status(200).json({ message: "Ainda não existem utilizadores registados.", count: 0, users: [] });
        }

        // Respondemos com a lista e a contagem
        res.status(200).json({
            count: users.length,
            users: users
        });

    } catch (error) {
        // Usamos o teu genericError para falhas na base de dados
        next(genericError(error.message));
    }
};