import express from "express";

import { verificarToken,verificarAdmin,} from "../middlewares/auth.middleware.js";
import { criarReserva,listarMinhasReservas,getReservasPorUtilizador,cancelarReservaAdmin,marcarComoPago } from "../controllers/reservas.controllers.js";
import { validarReservaInput, verificarDonoDoVeiculo } from '../middlewares/reservas.middleware.js';

const router = express.Router();

router.post("/", verificarToken, validarReservaInput, verificarDonoDoVeiculo, criarReserva);
router.get("/minhas-reservas", verificarToken, listarMinhasReservas);

//admin routes
router.get("/admin/utilizador/:id_utilizador", verificarToken, verificarAdmin, getReservasPorUtilizador);
router.delete("/admin/cancelar/:id_reserva", verificarToken, verificarAdmin, cancelarReservaAdmin);
router.patch("/admin/:id_reserva/pagar", verificarToken, verificarAdmin, marcarComoPago);


export default router;