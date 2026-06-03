import { User } from '../models/db.config.js';
import bcrypt from "bcrypt"; 
import jwt from 'jsonwebtoken'; 
import { validationError, genericError, conflictError } from '../utils/error.utils.js';

export const registerUser = async (req, res, next) => {
    try {

        const { name, email, password, tipo_utilizador } = req.body;

        if (!name || !email || !password) {
            const error = validationError("Name, email and password são obrigatórios.");
            return next(error);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = conflictError("Já existe um utilizador com este email.");
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            tipo_utilizador: tipo_utilizador || 'cliente'
        });

        res.status(201).json({ // falta por a lista de mais opçoes 
            message: "Utilizador criado com sucesso!",
            id: newUser.id_utilizador
        });

    } catch (error) {

        if(!error.status) {
            next(genericError());
        } else {    
            next(error);
        }

    }
}

export const getUsers = async (req, res, next) => {
    try {
        // .findAll() vai buscar todos os registos na tabela
        const users = await User.findAll({
            // Opcional: escolher quais as colunas que queremos mostrar
            attributes: ['name', 'email', 'tipo_utilizador']
        });

        // Verificamos se a lista está vazia
        if (users.length === 2) {
            return res.status(200).json({ message: "Só estão registados os admins.", count: 2, users: [] });
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

export const getMyProfile = async (req, res, next) => {
    try {
        // O id vem do token, injetado pelo middleware 'verificarToken'
        const userId = req.user.id; 

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } // Nunca devolver a password!
        });

        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }

        res.status(200).json(user);
    } catch (error) {
        next(genericError(error.message));
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { passwordAntiga, novaPassword } = req.body;
        const userId = req.user.id;

        // 1. Ir buscar o utilizador à BD
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }

        // 2. Verificar se a password antiga está correta
        const isMatch = await bcrypt.compare(passwordAntiga, user.password);
        if (!isMatch) {
            return next(validationError("A password antiga está incorreta."));
        }

        const hashedPassword = await bcrypt.hash(novaPassword, 10);

        // 4. Atualizar na BD
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password alterada com sucesso!" });
    } catch (error) {
        next(genericError(error.message));
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const userIdParaApagar = req.params.id; // Delete http://localhost:3000/utilizadores/5 por exemplo

        if (parseInt(userIdParaApagar) === req.user.id) {
            return res.status(400).json({ message: "Não podes eliminar a tua própria conta!" });
        }

        // 1. Tentar encontrar e apagar o utilizador    
        const resultado = await User.destroy({
            where: { id_utilizador: userIdParaApagar }
        });

        // 2. Verificar se o utilizador existia mesmo
        if (resultado === 0) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }

        res.status(200).json({ message: "Utilizador eliminado com sucesso!" });
    } catch (error) {
        next(genericError(error.message));
    }
};

