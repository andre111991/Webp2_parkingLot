import express from "express";
import { reservar, verReservas, cancelarReserva } from "../controllers/reservas.controllers.js";
import { verificarToken } from "../middlewares/user.middleware.js";

const router = express.Router();

// 1. Efetua a reserva para o veículo e vaga disponível
router.post("/", verificarToken, reservar); 

// 2. Utilizador vê as suas reservas ativas ou passadas
router.get("/utilizadores/:id", verificarToken, verReservas); 

// 3. Cancelar ou apagar reserva
router.delete("/:id", verificarToken, cancelarReserva); 

export default router;