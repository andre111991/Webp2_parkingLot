import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { validationError } from '../utils/error.utils.js';

export const validateRegister = (req, res, next) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        const error = validationError("Nome, email e password são obrigatórios no corpo do pedido.");
        return next(error);
    }

    if(email){
        // verifica o tamnho do email
        if (email.length < 5 || email.length > 100) {
            const error = validationError("O email deve conter entre 5 e 100 caracteres.");
            return next(error);
        }
    }

    // Remove espaços em branco extras que o utilizador possa ter enviado sem querer
    req.body.nome = nome.trim();
    req.body.email = email.trim().toLowerCase();

    // 3. Validação básica de formato de email (antes de ir à DB)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        const error = validationError("O formato do email introduzido é inválido.");
        return next(error);
    }

    // Validação da password mínimo 8 caracteres
    if (password.length < 8) {
        const error = validationError("A password deve conter pelo menos 8 caracteres.");
        return next(error);
    }

    // Verificar se a password contém pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
        const error = validationError("A password deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        return next(error);
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(validationError("Email e password são obrigatórios."));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(validationError("Formato de email inválido."));
    }

    next();
};



