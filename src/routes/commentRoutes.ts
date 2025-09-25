import { Router } from "express";
import { CommentController } from "../controllers/CommentController";

const router = Router();

// POST /comments - Crear un nuevo comentario
router.post("/", CommentController.create);

// GET /comments - Obtener todos los comentarios
router.get("/", CommentController.getAll);

// GET /comments/task/:taskId - Obtener comentarios de una tarea específica
router.get("/task/:taskId", CommentController.getByTask);

export default router;