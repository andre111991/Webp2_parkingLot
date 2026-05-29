import express from "express";
import { addVeiculo,getMeusVeiculos,getAllVeiculos } from "../controllers/veiculo.controllers.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";
import { validarVeiculoInput, verificarDonoVeiculo } from "../middlewares/veiculo.middleware.js";

const router = express.Router();
//Rotas Cliente

router.post("/", verificarToken, validarVeiculoInput, addVeiculo);
router.get("/meu", verificarToken, getMeusVeiculos);   // Listar apenas os seus veiculo
//router.put("/:id", verificarToken, verificarDonoVeiculo, updateVeiculo);      // Editar o seu veiculo 
//router.delete("/:id", verificarToken, verificarDonoVeiculo, deleteVeiculo);

//Rotas Admin
router.get("/admin/all", verificarToken, getAllVeiculos); // Admin vê todos os veículos
//router.delete("/admin/:id", verificarToken, verificarAdmin, adminDeleteVeiculo); // Admin apaga qualquer veículo

export default router;