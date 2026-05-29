import express from "express";

import { registerUser, getUsers, getMyProfile, changePassword,deleteUser } from '../controllers/user.controllers.js';
import { refreshToken,loginUser, logoutUser } from '../controllers/auth.controllers.js';
import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';
import { verificarAdmin, verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/registo", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/me", verificarToken, getMyProfile); 
router.put("/password", verificarToken, changePassword); // NOVA

router.post("/refresh", refreshToken);  // Rota para obter um novo token usando o refresh token

// Rotas Admin
router.get("/admin", verificarToken, verificarAdmin, getUsers);
router.delete("/admin/delete/:id", verificarToken, verificarAdmin, deleteUser);

export default router;