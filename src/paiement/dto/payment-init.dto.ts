import { User } from "src/user/entities/user.entity";
import { Paiement } from "../entities/paiement.entity";
import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum";

export interface PaymentInitDto {
    payment: Paiement;
    amount: string;
    fees: string;
    senderInfos: User;
    status: TransactionResponse,
    receiverNumber: string
}