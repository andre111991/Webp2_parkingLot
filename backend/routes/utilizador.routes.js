import express from "express";

import { RegisterUser, GetUsers, LoginUser } from '../controllers/user.controllers.js';
import { ValidateRegister, ValidateLogin  } from '../middlewares/user.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/", ValidateRegister, RegisterUser);
router.get("/", GetUsers);
//router.put("/" , updateUser);
router.post("/login", ValidateLogin, LoginUser);
//router.delete("/:id", deleteUser);



// Rotas Admin
// router.put("/", updateUser);
// router.delete("/", deleteUser);

export default router;