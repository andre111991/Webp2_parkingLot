import { User } from '../models/db.config.js';
import bcrypt from "bcrypt"; 
import jwt from 'jsonwebtoken'; 
import { validationError, genericError } from '../utils/error.utils.js';


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
            { expiresIn: '15m' } // O token expira em 15 minutos 
        );

        const refreshToken = jwt.sign(
            { id: user.id_utilizador }, // O refresh não precisa de ter o 'tipo'
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '7d' } 
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,  // O JS do browser não pode ler este cookie
            secure: process.env.NODE_ENV === 'production', // Só envia via se for HTTPS 
            sameSite: 'Strict', // Proteção contra ataques CSRF , Impede que o cookie seja enviado se o pedido vier de um site externo.
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias em milissegundos
        });

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

export const refreshToken = async (req, res, next) => {
    // 1. Ler o cookie que o navegador envia automaticamente
    const refreshToken = req.cookies.refreshToken;

    // Se o cookie não existir (ex: sessão expirada ou limpa), bloqueamos logo
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token em falta!" });
    }

    try {
        // 2. Verificar se o token é legítimo
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // 3. Ir à base de dados buscar o utilizador para validar que ainda existe
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(403).json({ message: "Utilizador inválido!" });
        }

        // 4. Gerar um NOVO Access Token
        const newAccessToken = jwt.sign(
            { id: user.id_utilizador, tipo: user.tipo_utilizador },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 5. Responder com o novo token
        res.status(200).json({ token: newAccessToken });

    } catch (error) {
        // Se o token for inválido ou tiver expirado, damos erro 403
        return res.status(403).json({ message: "Refresh token inválido ou expirado!" });
    }
};

export const logoutUser = (req, res) => {
    // Para fazer o logout, "limpamos" o cookie deixando de produzir novos acessTokens
    // No entanto tem uma brecha que o ultimo acessToken ainda pode ser usado até expirar
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    res.status(200).json({ message: "Logout efetuado com sucesso!" });
};