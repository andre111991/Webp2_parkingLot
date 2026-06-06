import express from "express";

import { verificarToken,verificarAdmin } from "../middlewares/auth.middleware.js";
import { iniciarCarregamento,listarMeusCarregamentos, getCarregamentosAdmin,cancelarCarregamentoAdmin,marcarCarregamentoComoPago } from "../controllers/carregamento.controllers.js";
import { validarCompatibilidade,validarCarregamentoInput } from "../middlewares/carregamentos.middleware.js";
import { verificarDonoDoVeiculo } from "../middlewares/reservas.middleware.js";

const router = express.Router();

//Iniciar carregamento
router.post("/", verificarToken,validarCarregamentoInput,validarCompatibilidade,verificarDonoDoVeiculo, iniciarCarregamento);
router.get("/meus-carregamentos", verificarToken, listarMeusCarregamentos);

// Rotas de Admin (protegidas por verificarAdmin)
router.get("/admin/ativos/:id", verificarToken, verificarAdmin, getCarregamentosAdmin); // aqui o id e de utilizador para ver os carregamentos associados aos veículos desse utilizador
router.delete("/admin/:id_carregamento/cancelar", verificarToken, verificarAdmin, cancelarCarregamentoAdmin);
router.patch("/admin/:id_carregamento/finalizar", verificarToken, verificarAdmin, marcarCarregamentoComoPago);


export default router;