import { AppDataSource } from "../config/database";
import { Task, TaskStatus } from "../entities/Task";

// Un objeto para definir las transiciones de estado válidas
const allowedTransitions = {
  [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [], // No se puede cambiar desde "finalizada"
  [TaskStatus.CANCELLED]: [], // No se puede cambiar desde "cancelada"
};

export class TaskService {
  private taskRepository = AppDataSource.getRepository(Task);

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new Error("Tarea no encontrada"); // Este error será capturado por el controller
    }

    // --- REGLA DE NEGOCIO 1: Restricciones de edición ---
    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.CANCELLED
    ) {
      // Si la tarea está finalizada o cancelada, no se puede editar.
      // Podrías permitir cambiar solo ciertos campos, pero por ahora bloqueamos todo.
      throw new Error("No se puede editar una tarea que está finalizada o cancelada.");
    }
    
    // --- REGLA DE NEGOCIO 2: Transiciones de estado válidas ---
    if (updates.status && updates.status !== task.status) {
      const transitions = allowedTransitions[task.status];
      if (!transitions || !transitions.includes(updates.status)) {
        throw new Error(
          `Transición de estado no válida de '${task.status}' a '${updates.status}'.`
        );
      }
    }

    // Si todas las reglas pasan, aplicamos los cambios
    this.taskRepository.merge(task, updates);
    return this.taskRepository.save(task);
  }
}