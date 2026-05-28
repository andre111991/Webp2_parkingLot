import express from "express";
import { addVeiculo } from "../controllers/veiculo.controllers.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();
//Rotas Cliente

router.post("/", verificarToken, addVeiculo);
//router.get("/", verificarToken, getVeiculos);
//router.get("/:id", verificarToken, getVeiculoById);
//router.put("/:id", verificarToken, updateVeiculo);
//router.delete("/:id", verificarToken, deleteVeiculo);

//Rotas Admin
//router.get("/admin/todos", verificarToken, verificarAdmin, getVeiculos); // Admin vê todos os veículos
//router.delete("/admin/:id", verificarToken, verificarAdmin, deleteVeiculo); // Admin apaga qualquer veículo

export default router;