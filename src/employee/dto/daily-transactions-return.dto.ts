import { Paiement } from "src/paiement/entities/paiement.entity";
import { Transfert } from "src/transfert/entities/transfert.entity";

export interface DailyTransactionsReturnDto {
    date: Date;
    amount: number;
}