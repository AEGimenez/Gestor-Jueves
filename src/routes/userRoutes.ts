import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

//Obtener usuarios
router.get("/", UserController.getAll);

//Crear un nuevo usuario
router.post("/", UserController.create);

export default router;