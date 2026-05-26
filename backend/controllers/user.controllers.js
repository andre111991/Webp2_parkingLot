import { User } from '../models/db.config.js';
import bcrypt from "bcrypt"; 
import jwt from 'jsonwebtoken'; 
import { validationError, genericError, conflictError } from '../utils/error.utils.js';


export const registerUser = async (req, res, next) => {
    try {

        const { name, email, password, tipo_utilizador } = req.body;

        if (!name || !email || !password) {
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

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(validationError("Credenciais inválidas.")); 
        }

        // 2. Verificar a password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(validationError("Credenciais inválidas."));
        }

        // 3. Gerar o Token JWT
        const token = jwt.sign(
            { id: user.id_utilizador, tipo: user.tipo_utilizador },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // O token expira em 1 dia !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ALTERAR PARA 15MIN
        );

        // 4. Enviar resposta
        res.status(200).json({
            message: "Login efetuado com sucesso!",
            token: token,
            user: {
                id: user.id_utilizador,
                name: user.name,
                tipo: user.tipo_utilizador
            }
        });

    } catch (error) {
        next(genericError(error.message));
    }
};