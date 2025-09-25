import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Comment } from "../entities/Comment";
import { User } from "../entities/User";
import { Task } from "../entities/Task";

export class CommentController {
  // Crear un nuevo comentario
  static async create(req: Request, res: Response) {
    try {
      const { content, taskId, authorId } = req.body;
      
      //obtiene repositorios
      const commentRepository = AppDataSource.getRepository(Comment);
      const userRepository = AppDataSource.getRepository(User);
      const taskRepository = AppDataSource.getRepository(Task);
      
      // Valida la existencia de la tarea
      const task = await taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({
          message: "Tarea no encontrada"
        });
      }

      // Valida la existencia del usuario autor
      const author = await userRepository.findOne({ where: { id: authorId } });
      if (!author) {
        return res.status(404).json({
          message: "Usuario autor no encontrado"
        });
      }

      // Crear nuevo comentario
      const newComment = commentRepository.create({
        content,
        taskId,
        authorId
      });

      // Guardar en la base de datos
      const savedComment = await commentRepository.save(newComment);
      
      // Obtener el comentario con las relaciones task y author y reponde 201 con el comentario creado
      const commentWithRelations = await commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ["task", "author"]
      });
      
      res.status(201).json({
        message: "Comentario creado correctamente",
        data: commentWithRelations
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear comentario",  //si algo falla responde 500 
        error
      });
    }
  }

  // Obtener comentarios de una tarea específica
  static async getByTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      
      const commentRepository = AppDataSource.getRepository(Comment);
      
      const comments = await commentRepository.find({
        where: { taskId: parseInt(taskId) },
        relations: ["author", "task"],
        order: { createdAt: "ASC" } // Ordenar por fecha de creación de manera ascendente
      });
      
      res.json({
        message: "Comentarios obtenidos correctamente",
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener comentarios",
        error
      });
    }
  }

  // Obtener todos los comentarios (opcional)
  static async getAll(req: Request, res: Response) {
    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      
      const comments = await commentRepository.find({
        relations: ["task", "author"],
        order: { createdAt: "DESC" } // Ordenar por fecha de creación de manera descendente
      });
      
      res.json({
        message: "Todos los comentarios obtenidos correctamente",
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener comentarios",
        error
      });
    }
  }
}