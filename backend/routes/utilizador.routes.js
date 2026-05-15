import express from "express";

import { RegisterUser, GetUsers, LoginUser } from '../controllers/user.controllers.js';

import { validateRegister, validateLogin  } from '../middlewares/user.middleware.js';

const router = express.Router();

// Rotas Cliente
router.post("/" , validateRegister, RegisterUser);
router.get("/", GetUsers);
//router.put("/" , UpdateUser);
router.post("/login", validateLogin, LoginUser);
//router.delete("/:id", DeleteUser);



// Rotas Admin
// router.put("/", UpdateUser);
// router.delete("/", DeleteUser);








export default router;