import { Paiement } from "src/paiement/entities/paiement.entity";
import { Transfert } from "src/transfert/entities/transfert.entity";

export interface EmployeeActivityDto {
    paiements: Paiement[],
    transferts: Transfert[],
    totalPaiement: number,
    totalTransfert: number
}