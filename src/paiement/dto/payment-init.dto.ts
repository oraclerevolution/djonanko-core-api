import { User } from "src/user/entities/user.entity";
import { Paiement } from "../entities/paiement.entity";
import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum";
import { Historique } from "src/historiques/entities/historique.entity";

export interface PaymentInitDto {
    payment: Paiement;
    amount: string;
    fees: string;
    historique: Historique;
    senderInfos: User;
    status: TransactionResponse,
    receiverNumber: string
}