import { Historique } from "../entities/historique.entity"

export type HistoriqueFilterDto = {
    historiques: Historique[],
    count: number
}