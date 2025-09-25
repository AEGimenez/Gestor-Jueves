import { Router } from "express";
import { TeamMembershipController } from "../controllers/TeamMembershipController";

const router = Router();

// POST /memberships - Agregar usuario a equipo
router.post("/", TeamMembershipController.addMember);

// GET /memberships/team/:teamId - Miembros de un equipo
router.get("/team/:teamId", TeamMembershipController.getTeamMembers);

// GET /memberships/user/:userId - Equipos de un usuario
router.get("/user/:userId", TeamMembershipController.getUserTeams);

export default router;