import express from "express";

import { RegisterUser, GetUsers } from '../controllers/user.controllers.js';

const router = express.Router();

router.post("/" , RegisterUser);
router.get("/", GetUsers);


// router.get("/:id", GetUserById);
// router.put("/:id", UpdateUser);
// router.delete("/:id", DeleteUser);








export default router;