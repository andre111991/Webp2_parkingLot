import express from "express";
import { addVeiculo, getVeiculos, deleteVeiculo, getVeiculoById, updateVeiculo } from "../controllers/veiculo.controllers.js";

const router = express.Router();

router.post("/", addVeiculo);
router.get("/", getVeiculos);
router.get("/:id", getVeiculoById);
router.put("/:id", updateVeiculo);
router.delete("/:id", deleteVeiculo);

export default router;