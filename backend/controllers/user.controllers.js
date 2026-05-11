import { User } from '../models/db.config.js';
import bcrypt from "bcrypt"; // para encriptar a password
import { validationError, genericError, conflictError } from '../utils/error.utils.js';


export const RegisterUser = async (req, res, next) => {
    try {

        const { nome, email, password, tipo_utilizador } = req.body;

        if (!nome || !email || !password) {
            const error = validationError("Name, email and password are required.");
            return next(error);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = conflictError("A user with this email already exists.");
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nome,
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