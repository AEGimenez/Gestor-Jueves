import { Router } from "express";
import { TeamController } from "../controllers/TeamController";

const router = Router();

// GET /teams - Obtener todos los equipos
router.get("/", TeamController.getAll);

// POST /teams - Crear un nuevo equipo
router.post("/", TeamController.create);

// DELETE /teams/:id - Eliminar un equipo
router.delete("/:id", TeamController.delete); 

// UPDATE /teams/:id - Actualizar un equipo
router.patch('/:id', TeamController.update);

export default router;