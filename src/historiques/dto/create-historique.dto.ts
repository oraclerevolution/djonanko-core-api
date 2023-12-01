import { Historique } from "../entities/historique.entity";

export type CreateHistoriqueDto = Omit<Historique, 'id' | 'createdAt' | 'updatedAt'>