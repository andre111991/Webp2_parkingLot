import express from "express";

const router = express.Router();

router.post("/veiculos", AddVeiculo);
router.get("/veiculos", GetVeiculos);
router.delete("/veiculos/:id", DeleteVeiculo);
router.get("/veiculos/:id", GetVeiculoById);
router.put("/veiculos/:id", UpdateVeiculo);

export default router;