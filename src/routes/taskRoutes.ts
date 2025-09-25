import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

const router = Router();

// GET /tasks - Obtener todas las tareas
router.get("/", TaskController.getAll);

// POST /tasks - Crear una nueva tarea
router.post("/", TaskController.create);

// PUT /tasks/:id/status - Actualizar estado de tarea
router.put("/:id/status", TaskController.update);

// Rutas para un recurso de tarea específico
router.get("/:id", TaskController.getOneById);
router.patch("/:id", TaskController.update); // Usamos PATCH para actualizaciones
router.delete("/:id", TaskController.delete);


export default router;