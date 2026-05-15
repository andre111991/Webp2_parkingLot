import { validationError } from '../utils/error.utils.js';

export const validateRegister = (req, res, next) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return next(validationError("Nome, email e password são obrigatórios no corpo do pedido."));
    }

    if(email){
        // verifica o tamnho do email
        if (email.length < 5 || email.length > 100) {
            return next(validationError("O email deve conter entre 5 e 100 caracteres."));
        }
    }

    // Remove espaços em branco extras que o utilizador possa ter enviado sem querer
    req.body.nome = nome.trim();
    req.body.email = email.trim().toLowerCase();

    // 3. Validação básica de formato de email (antes de ir à DB)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return next(validationError("O formato do email introduzido é inválido."));
    }

    next();
};