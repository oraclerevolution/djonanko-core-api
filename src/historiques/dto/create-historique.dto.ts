import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum";
import { Historique } from "../entities/historique.entity";

export type CreateHistoriqueDto = Omit<Historique, 'id' | 'createdAt' | 'updatedAt'>

export interface CreateHistoriqueResultDto  {
    historique: Historique,
    status: TransactionResponse
}