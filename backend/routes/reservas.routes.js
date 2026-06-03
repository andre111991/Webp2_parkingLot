import express from "express";

import { verificarToken,verificarAdmin} from "../middlewares/auth.middleware.js";
import { criarReserva } from "../controllers/reservas.controllers.js";
import { validarReservaInput, verificarDonoDoVeiculo } from '../middlewares/reservas.middleware.js';

const router = express.Router();

router.post("/", verificarToken, validarReservaInput, verificarDonoDoVeiculo, criarReserva);
// router.get("/minhas", verificarToken, getMinhasReservas);
// router.delete("/:id", verificarToken, verificarDonoDaReserva, cancelarReserva);

//// Histórico completo (reservas passadas e futuras)
//router.get("/historico", verificarToken, getHistoricoReservas);

//admin routes

//router.get("/admin", verificarToken, verificarAdmin, getAllReservas);
//router.patch("/:id/pagar", verificarToken, verificarAdmin, marcarComoPago);






























export default router;