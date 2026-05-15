import express from "express";

const router = express.Router();

router.post("/reservas", Reservar);
router.get("/reservas", VerReservas);
router.delete("/reservas/:id", ApagarReserva);
router.put("/reservas/:id", UpdateReserva);

export default router;