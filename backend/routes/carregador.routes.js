import express from "express";
import { IniciarCarregamento, FinalizarCarregamento, HistoricoCarregamento } from "../controllers/carregador.controllers.js";
import { verificarToken } from "../middlewares/user.middleware.js";

const router = express.Router();

// 1. Inicia o carregamento
router.post("/carregamentos", verificarToken, IniciarCarregamento); 

// 2. Para o carregamento e faz o pagamento
router.put("/carregamentos/:id/finalizar", verificarToken, FinalizarCarregamento); 

// 3. Utilizador vê carregamentos feitos anteriormente
router.get("/utilizadores/:id/carregamentos", verificarToken, HistoricoCarregamento); 

export default router;