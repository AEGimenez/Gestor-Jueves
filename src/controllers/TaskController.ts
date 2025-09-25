import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Task } from "../entities/Task";
import { TaskService } from "../services/TaskService";

export class TaskController {
  // Obtener todas las tareas
  static async getAll(req: Request, res: Response) {
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const tasks = await taskRepository.find({
        relations: ["team", "createdBy", "assignedTo"],
      });
      res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener tareas" });
    }
  }

  // Obtener una tarea por ID
  static async getOneById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({
        where: { id },
        relations: ["team", "createdBy", "assignedTo", "comments", "comments.author"],
      });
      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la tarea" });
    }
  }
  
  // Crear una nueva tarea
  static async create(req: Request, res: Response) {
    try {
      // La lógica de negocio se delega al servicio
      const taskService = new TaskService();
      const createdTask = await taskService.createTask(req.body);
      res.status(201).json(createdTask);
    } catch (error) {
        if (error instanceof Error) {
            // Errores de negocio (ej. fecha pasada) o de datos (FK no encontrada)
            // devuelven un 400 Bad Request.
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Error interno al crear tarea" });
    }
  }

  // Actualizar una tarea por ID (usando el servicio)
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const taskService = new TaskService();
      
      // El servicio contiene toda la lógica de validación y actualización
      const updatedTask = await taskService.updateTask(id, updates);

      res.json(updatedTask);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Tarea no encontrada")) {
          return res.status(404).json({ message: error.message });
        }
        // Para cualquier otro error de regla de negocio (ej: transición inválida)
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error interno al actualizar la tarea" });
    }
  }
  
  // Eliminar una tarea por ID
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const taskRepository = AppDataSource.getRepository(Task);
      const result = await taskRepository.delete(id);
      if (result.affected === 0) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la tarea" });
    }
  }
}

