import express from "express";

import { addVeiculo,getMeusVeiculos,getAllVeiculos,updateVeiculo,deleteVeiculo,adminDeleteVeiculo } from "../controllers/veiculo.controllers.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";
import { validarVeiculoInput, verificarDonoVeiculo,verificarDependenciasExclusao } from "../middlewares/veiculo.middleware.js";

const router = express.Router();

//Rotas Cliente

router.post("/", verificarToken, validarVeiculoInput, addVeiculo);
router.get("/meu", verificarToken, getMeusVeiculos);   // Listar apenas os seus veiculo
router.put("/editar/:id_veiculo", verificarToken, verificarDonoVeiculo, validarVeiculoInput, updateVeiculo);      // Editar o seu veiculo 
router.delete("/apagar/:id_veiculo", verificarToken, verificarDonoVeiculo,verificarDependenciasExclusao, deleteVeiculo);

//Rotas Admin
router.get("/admin/all", verificarToken, getAllVeiculos); // Admin vê todos os veículos
router.delete("/admin/apagar/:id_veiculo", verificarToken, verificarAdmin, verificarDependenciasExclusao,adminDeleteVeiculo); // Admin apaga qualquer veículo

export default router;