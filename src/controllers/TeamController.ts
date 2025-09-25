import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { TeamService } from "../services/TeamService"; // 1. Importamos el TeamService

export class TeamController {
  // Obtener todos los equipos (sin cambios)
  static async getAll(req: Request, res: Response) {
    try {
      const teamRepository = AppDataSource.getRepository(Team);
      const teams = await teamRepository.find({
        relations: ["owner"],
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

  // Crear un nuevo equipo (sin cambios funcionales)
  static async create(req: Request, res: Response) {
    try {
      const { name, description, ownerId } = req.body;
      const teamRepository = AppDataSource.getRepository(Team);
      const userRepository = AppDataSource.getRepository(User);
      
      const owner = await userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({
          message: "Usuario propietario no encontrado"
        });
      }

      const newTeam = teamRepository.create({
        name,
        description,
        ownerId
      });
      const savedTeam = await teamRepository.save(newTeam);
      
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

  // --- MÉTODO DELETE QUE USA EL SERVICIO ---
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // 2. Creamos una instancia del servicio
      const teamService = new TeamService();

      // 3. Llamamos al método del servicio, que contiene la regla de negocio
      await teamService.deleteTeam(id);

      // 204 No Content es la respuesta estándar para un borrado exitoso
      res.status(204).send();

    } catch (error) {
      // 4. Capturamos los errores de negocio que vienen del servicio
      if (error instanceof Error) {
        if (error.message.includes("Equipo no encontrado")) {
          return res.status(404).json({ message: error.message });
        }
        // Para la regla de negocio de tareas activas, devolvemos 400 Bad Request.
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error interno al eliminar el equipo" });
    }
  }

    // --- MÉTODO UPDATE ---
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;

      const teamRepository = AppDataSource.getRepository(Team);
      const team = await teamRepository.findOne({ where: { id } });

      if (!team) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }

      // Solo actualiza los campos enviados
      if (name !== undefined) team.name = name;
      if (description !== undefined) team.description = description;

      const updatedTeam = await teamRepository.save(team);

      res.json({
        message: "Equipo actualizado correctamente",
        data: updatedTeam
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar equipo",
        error
      });
    }
  }

  
}



