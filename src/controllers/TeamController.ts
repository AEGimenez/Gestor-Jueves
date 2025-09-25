import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

export class TeamController {
  // Obtener todos los equipos
  static async getAll(req: Request, res: Response) {
    try {
      const teamRepository = AppDataSource.getRepository(Team);
      
      // Incluimos información del propietario
      const teams = await teamRepository.find({
        relations: ["owner"] // ← Esto incluye los datos del usuario propietario
      });
      
      res.json({
        message: "Equipos obtenidos correctamente",
        data: teams
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener equipos",
        error
      });
    }
  }

  // Crear un nuevo equipo
  static async create(req: Request, res: Response) {
    try {
      const { name, description, ownerId } = req.body;
      
      const teamRepository = AppDataSource.getRepository(Team);
      const userRepository = AppDataSource.getRepository(User);
      
      // Verificar que el propietario existe
      const owner = await userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({
          message: "Usuario propietario no encontrado"
        });
      }

      // Crear nuevo equipo
      const newTeam = teamRepository.create({
        name,
        description,
        ownerId
      });

      // Guardar en la base de datos
      const savedTeam = await teamRepository.save(newTeam);
      
      // Obtener el equipo con la información del propietario
      const teamWithOwner = await teamRepository.findOne({
        where: { id: savedTeam.id },
        relations: ["owner"]
      });
      
      res.status(201).json({
        message: "Equipo creado correctamente",
        data: teamWithOwner
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear equipo",
        error
      });
    }
  }
}