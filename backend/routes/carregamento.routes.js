import express from "express";

import { verificarToken } from "../middlewares/auth.middleware.js";
import { iniciarCarregamento, finalizarCarregamento } from "../controllers/carregamento.controllers.js";
import { validarCompatibilidade } from "../middlewares/carregamentos.middleware.js";

const router = express.Router();

//Iniciar carregamento
router.post("/", verificarToken, validarCompatibilidade, iniciarCarregamento);

// Finalizar carregamento
//router.patch("/:id", verificarToken, finalizarCarregamento);

//router.get("/historico", verificarToken, getHistoricoCarregamentos);

// Rotas de Admin (protegidas por verificarAdmin)
///router.get("/admin/ativos", verificarToken, verificarAdmin, getCarregamentosAtivosAdmin);
//router.get("/admin/relatorio", verificarToken, verificarAdmin, getRelatorioCarregamentos);
//router.patch("/admin/:id/finalizar", verificarToken, verificarAdmin, finalizarForcado);








export default router;