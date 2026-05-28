import express from "express";

import { registerUser, getUsers, loginUser } from '../controllers/user.controllers.js';
import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';
import { verificarAdmin, verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/registo", validateRegister, registerUser);
//router.put("/" , updateUser);
router.post("/login", validateLogin, loginUser);
//router.delete("/:id", deleteUser);



// Rotas Admin
router.get("/", verificarToken, verificarAdmin, getUsers);
//router.put("/:id", verificarToken, verificarAdmin, updateUser);
// router.delete("/:id", verificarToken, verificarAdmin, deleteUser);

export default router;