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
      
      // Incluimos todas las relaciones
      const tasks = await taskRepository.find({
        relations: ["team", "createdBy", "assignedTo"]
      });
      
      res.json({
        message: "Tareas obtenidas correctamente",
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener tareas",
        error
      });
    }
  }

  // Crear una nueva tarea
  static async create(req: Request, res: Response) {
    try {
      const { 
        title, 
        description, 
        teamId, 
        createdById, 
        assignedToId,
        priority = TaskPriority.MEDIUM,
        dueDate 
      } = req.body;
      
      const taskRepository = AppDataSource.getRepository(Task);
      const userRepository = AppDataSource.getRepository(User);
      const teamRepository = AppDataSource.getRepository(Team);
      
      // Verificar que el equipo existe
      const team = await teamRepository.findOne({ where: { id: teamId } });
      if (!team) {
        return res.status(404).json({
          message: "Equipo no encontrado"
        });
      }

      // Verificar que el creador existe
      const createdBy = await userRepository.findOne({ where: { id: createdById } });
      if (!createdBy) {
        return res.status(404).json({
          message: "Usuario creador no encontrado"
        });
      }

      // Verificar usuario asignado (si se proporciona)
      if (assignedToId) {
        const assignedTo = await userRepository.findOne({ where: { id: assignedToId } });
        if (!assignedTo) {
          return res.status(404).json({
            message: "Usuario asignado no encontrado"
          });
        }
      }

      // Crear nueva tarea
      const newTask = taskRepository.create({
        title,
        description,
        teamId,
        createdById,
        assignedToId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined
      });

      // Guardar en la base de datos
      const savedTask = await taskRepository.save(newTask);
      
      // Obtener la tarea con todas las relaciones
      const taskWithRelations = await taskRepository.findOne({
        where: { id: savedTask.id },
        relations: ["team", "createdBy", "assignedTo"]
      });
      
      res.status(201).json({
        message: "Tarea creada correctamente",
        data: taskWithRelations
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear tarea",
        error
      });
    }
  }

  // Actualizar estado de tarea
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const taskRepository = AppDataSource.getRepository(Task);
      
      // Verificar que la tarea existe
      const task = await taskRepository.findOne({ where: { id: parseInt(id) } });
      if (!task) {
        return res.status(404).json({
          message: "Tarea no encontrada"
        });
      }

      // Actualizar estado
      task.status = status;
      const updatedTask = await taskRepository.save(task);
      
      // Obtener con relaciones
      const taskWithRelations = await taskRepository.findOne({
        where: { id: updatedTask.id },
        relations: ["team", "createdBy", "assignedTo"]
      });
      
      res.json({
        message: "Estado de tarea actualizado",
        data: taskWithRelations
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar estado",
        error
      });
    }
  }
}