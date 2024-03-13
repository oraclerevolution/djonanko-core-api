import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum";
import { Paiement } from "../entities/paiement.entity";

export type MakePaiementDto = {
    amount: string;
    senderPhoneNumber: string;
    receiverPhoneNumber: string;
    fees?: string;
}

export interface makePaiementResultDto {
    paiement: Paiement
    status: TransactionResponse
}