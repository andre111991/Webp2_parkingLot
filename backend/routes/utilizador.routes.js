import express from "express";

import { registerUser, getUsers,  } from '../controllers/user.controllers.js';
import { refreshToken,loginUser } from '../controllers/auth.controllers.js';
import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';
import { verificarAdmin, verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/registo", validateRegister, registerUser);
router.post("/refresh", refreshToken); // Rota para obter um novo token usando o refresh token
router.post("/login", validateLogin, loginUser);
//router.delete("/:id", deleteUser);
//router.put("/" , updateUser);



// Rotas Admin
router.get("/", verificarToken, verificarAdmin, getUsers);
//router.put("/:id", verificarToken, verificarAdmin, updateUser);
// router.delete("/:id", verificarToken, verificarAdmin, deleteUser);

export default router;