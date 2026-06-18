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
            { id: user.id_utilizador,
              tipo: user.tipo
            }, // O refresh não precisa de ter o 'tipo'
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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token em falta!" });
    }

    try {
        // 1. Verificar a legitimidade do token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // 2. Buscar o utilizador (incluindo o tipo para garantir que o dado é atual)
        const user = await User.findByPk(decoded.id);
        
        // Se o utilizador foi apagado ou bloqueado entretanto
        if (!user) {
            return res.status(403).json({ message: "Utilizador inexistente!" });
        }

        // 3. Gerar novo Access Token com os dados mais recentes do utilizador
        // Usamos 'user.tipo' (ou o nome da tua coluna correta)
        const newAccessToken = jwt.sign(
            { 
                id: user.id_utilizador, 
                tipo: user.tipo_utilizador 
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({ token: newAccessToken });

    } catch (error) {
        // Log do erro no servidor para poderes depurar no VS Code
        console.error("Erro no Refresh Token:", error.message);
        
        // Limpar o cookie se o token for inválido é uma boa prática de segurança
        res.clearCookie('refreshToken');
        
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