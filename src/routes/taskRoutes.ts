import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

const router = Router();

// GET /tasks - Obtener todas las tareas
router.get("/", TaskController.getAll);

// POST /tasks - Crear una nueva tarea
router.post("/", TaskController.create);

// PUT /tasks/:id/status - Actualizar estado de tarea
router.put("/:id/status", TaskController.updateStatus);

export default router;