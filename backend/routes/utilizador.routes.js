import express from "express";

import { RegisterUser, GetUsers } from '../controllers/user.controllers.js';

import { validateRegister } from '../middlewares/user.middleware.js';

const router = express.Router();

router.post("/" , validateRegister, RegisterUser);
router.get("/", GetUsers);


// router.get("/:id", GetUserById);
// router.put("/:id", UpdateUser);
// router.delete("/:id", DeleteUser);








export default router;