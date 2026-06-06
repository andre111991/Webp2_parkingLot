import express from "express";

import { verificarToken,verificarAdmin } from "../middlewares/auth.middleware.js";
import { iniciarCarregamento, getCarregamentosAdmin,cancelarCarregamentoAdmin } from "../controllers/carregamento.controllers.js";
import { validarCompatibilidade } from "../middlewares/carregamentos.middleware.js";

const router = express.Router();

//Iniciar carregamento
router.post("/", verificarToken, validarCompatibilidade, iniciarCarregamento);

//router.get("/historico", verificarToken, getHistoricoCarregamentos);

// Rotas de Admin (protegidas por verificarAdmin)
router.get("/admin/ativos", verificarToken, verificarAdmin, getCarregamentosAdmin);
router.delete("/admin/relatorio", verificarToken, verificarAdmin, cancelarCarregamentoAdmin);
//router.patch("/admin/:id/finalizar", verificarToken, verificarAdmin, finalizarForcado);


export default router;