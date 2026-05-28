import jwt from 'jsonwebtoken';
import { adminOnlyError } from '../utils/error.utils.js';

//Verificar Admin só corre se usar primeiro o verificarToken, porque ele é quem adiciona o req.user ou seja, se o user existe e mais abaixo na parte de admin, se o tipo=admin

export const verificarToken = (req, res, next) => {
    // 1. Obter o token do header (geralmente no formato: Bearer <token>)
    const authHeader = req.headers['authorization']; //key no postman: Authorization
    const token = authHeader && authHeader.split(' ')[1]; // Pega apenas a parte do token

    if (!token) {
        return res.status(401).json({ message: "Acesso negado" });
    }

    try {
        // 2. Verificar o token com a mesma chave secreta usada no login
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Adicionar os dados do utilizador ao objeto 'req'
        // Assim, nos teus controllers, podes aceder com req.user
        req.user = decoded; 

        next(); // Tudo ok, prossegue para o controller
    } catch (error) {
        return res.status(403).json({ message: "Token inválido ou expirado!" });
    }
};

export const verificarAdmin = (req, res, next) => {
    // Verifica se o utilizador existe no request e se o tipo é admin
    if (req.user && req.user.tipo === 'admin') {
        next(); // Está tudo bem, é admin, segue caminho
    } else {
        return next(adminOnlyError("Acesso negado: Requer privilégios de administrador!"));
    }
};

