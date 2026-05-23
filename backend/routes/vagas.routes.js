import express from "express";
import { listarVagas} from "../controllers/vaga.controllers.js";

const router = express.Router();

// 1. Listar vagas
router.get("/", listarVagas); 

export default router;