import express from "express";

import { registerUser, getUsers, loginUser } from '../controllers/user.controllers.js';
import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';
import { verificarAdmin } from '../middlewares/user.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/register", validateRegister, registerUser);
router.get("/", getUsers);
//router.put("/" , updateUser);
router.post("/login", validateLogin, loginUser);
//router.delete("/:id", deleteUser);



// Rotas Admin
router.put("/:id", verificarToken, verificarAdmin, updateUser);
router.delete("/:id", verificarToken, verificarAdmin, deleteUser);

export default router;