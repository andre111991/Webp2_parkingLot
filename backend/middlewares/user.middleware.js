import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { ValidationError } from '../utils/error.utils.js';

export const ValidateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = ValidationError("Name, email and password are required.");
        return next(error);
    }

    if(email){
        // verifica o tamnho do email
        if (email.length < 5 || email.length > 100) {
            const error = ValidationError("O email deve conter entre 5 e 100 caracteres.");
            return next(error);
        }
    }

    // Remove espaços em branco extras que o utilizador possa ter enviado sem querer
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();

    // 3. Validação básica de formato de email (antes de ir à DB)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        const error = ValidationError("O formato do email introduzido é inválido.");
        return next(error);
    }

    // Validação da password mínimo 8 caracteres
    if (password.length < 8) {
        const error = ValidationError("A password deve conter pelo menos 8 caracteres.");
        return next(error);
    }

    // Verificar se a password contém pelo menos uma letra maiúscula, uma letra minúscula, um número e um caracter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
        const error = ValidationError("A password deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        return next(error);
    }

    next();
};

export const ValidateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(ValidationError("Email e password são obrigatórios."));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(ValidationError("Formato de email inválido."));
    }

    next();
};



