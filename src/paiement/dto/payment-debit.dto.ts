import { CompteReservation } from "src/compte-reservation/entities/compte-reservation.entity"
import { Paiement } from "../entities/paiement.entity"
import { User } from "src/user/entities/user.entity"
import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum"

export interface PaymentDebitDto {
    paiement: Paiement
    reservation: CompteReservation | null,
    amount: string,
    receiverNumber: string,
    senderInfos: User,
    fees: string,
    status: TransactionResponse
}