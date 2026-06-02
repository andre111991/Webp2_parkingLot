import express from "express";

import { getAllVagas,getVagaById,createVaga,updateVaga,deleteVaga} from "../controllers/vagas.controllers.js";
import { verificarToken,verificarAdmin} from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Listar vagas
router.get("/", verificarToken, getAllVagas);
router.get("/:id", verificarToken, getVagaById);

//admin routes

router.post("/admin", verificarToken, verificarAdmin, createVaga);
router.put("/admin/:id", verificarToken, verificarAdmin, updateVaga);
router.delete("/admin/apagar/:id", verificarToken, verificarAdmin, deleteVaga);

export default router;