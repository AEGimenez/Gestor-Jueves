import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

// GET /users - Obtener todos los usuarios
router.get("/", UserController.getAll);

// POST /users - Crear un nuevo usuario
router.post("/", UserController.create);

export default router;