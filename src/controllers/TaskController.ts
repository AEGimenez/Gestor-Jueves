import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Task, TaskStatus, TaskPriority } from "../entities/Task";
import { User } from "../entities/User";
import { Team } from "../entities/Team";

export class TaskController {
  // Obtener todas las tareas
  static async getAll(req: Request, res: Response) {
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const tasks = await taskRepository.find({
        relations: ["team", "createdBy", "assignedTo"],
      });
      // Respuesta simplificada, solo los datos.
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener tareas", error });
    }
  }

  // Crear una nueva tarea
  static async create(req: Request, res: Response) {
    try {
      const taskData = req.body;
      const taskRepository = AppDataSource.getRepository(Task);
      
      // Asignamos directamente los objetos completos a las relaciones
      const newTask = taskRepository.create({
        ...taskData,
        team: { id: taskData.teamId },
        createdBy: { id: taskData.createdById },
        assignedTo: taskData.assignedToId ? { id: taskData.assignedToId } : undefined,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      });

      const savedTask = await taskRepository.save(newTask);
      res.status(201).json(savedTask);
    } catch (error) {
      // Manejo de errores más específico para claves foráneas
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes("FOREIGN KEY constraint failed")) {
        return res.status(404).json({ message: "Equipo, creador o usuario asignado no encontrado." });
      }
      res.status(500).json({ message: "Error al crear tarea", error });
    }
  }

  // --- NUEVOS MÉTODOS ---

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
      res.status(500).json({ message: "Error al obtener la tarea", error });
    }
  }

  // Actualizar una tarea por ID (usando PATCH)
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const taskRepository = AppDataSource.getRepository(Task);

      const task = await taskRepository.findOneBy({ id });
      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }

      // TODO: Implementar reglas de negocio aquí
      // ej: if (task.status === TaskStatus.COMPLETED) { throw new Error(...) }

      // Actualiza la entidad con los nuevos datos
      taskRepository.merge(task, updates);
      const updatedTask = await taskRepository.save(task);

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la tarea", error });
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

      // 204 No Content es la respuesta estándar para un borrado exitoso
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la tarea", error });
    }
  }
}