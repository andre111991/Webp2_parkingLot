import express from "express";
import { Reservar, VerReservas, CancelarReserva } from "../controllers/reserva.controllers.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Efetua a reserva para o veículo e vaga disponível
router.post("/reservas", verificarToken, Reservar); 

// 2. Utilizador vê as suas reservas ativas ou passadas
router.get("/utilizadores/:id/reservas", verificarToken, VerReservas); 

// 3. Cancelar ou apagar reserva
router.delete("/reservas/:id/cancelar", verificarToken, CancelarReserva); 

export default router;