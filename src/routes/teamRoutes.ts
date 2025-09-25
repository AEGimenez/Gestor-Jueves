import { Router } from "express";
import { TeamController } from "../controllers/TeamController";

const router = Router();

// GET /teams - Obtener todos los equipos
router.get("/", TeamController.getAll);

// POST /teams - Crear un nuevo equipo
router.post("/", TeamController.create);

export default router;