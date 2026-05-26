import express from "express";

import { registerUser, getUsers, loginUser } from '../controllers/user.controllers.js';
import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/", validateRegister, registerUser);
router.get("/", getUsers);
//router.put("/" , updateUser);
router.post("/login", validateLogin, loginUser);
//router.delete("/:id", deleteUser);



// Rotas Admin
// router.put("/", updateUser);
// router.delete("/", deleteUser);

export default router;