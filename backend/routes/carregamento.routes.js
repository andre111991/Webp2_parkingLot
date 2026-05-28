import express from "express";

import { iniciarCarregamento, finalizarCarregamento } from "../controllers/carregamento.controllers.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Inicia o carregamento
router.post("/", verificarToken, iniciarCarregamento); 

// 2. Para o carregamento e faz o pagamento
router.put("/:id/finalizar", verificarToken, finalizarCarregamento); 

// 3. Utilizador vê carregamentos feitos anteriormente
// router.get("/utilizadores/:id", verificarToken, historicoCarregamento); 

export default router;