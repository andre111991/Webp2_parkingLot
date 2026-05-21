import express from "express";
import { ListarVagas} from "../controllers/vaga.controllers.js";

const router = express.Router();

// 1. Listar vagas
router.get("/", ListarVagas); 

export default router;