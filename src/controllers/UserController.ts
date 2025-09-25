import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export class UserController {
  // Obtener todos los usuarios
  static async getAll(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
       
      res.json({
        message: "Usuarios obtenidos correctamente",
        data: users
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener usuarios",
        error
      });
    }
  }

  // Crear un nuevo usuario
  static async create(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Crear nueva instancia de usuario
      const newUser = userRepository.create({
        email,
        password, 
        firstName,
        lastName
      });

      // Guardar en la base de datos
      const savedUser = await userRepository.save(newUser);
      
      res.status(201).json({
        message: "Usuario creado correctamente",
        data: savedUser
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear usuario",
        error
      });
    }
  }
}