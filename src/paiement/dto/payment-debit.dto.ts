import { CompteReservation } from "src/compte-reservation/entities/compte-reservation.entity"
import { Paiement } from "../entities/paiement.entity"
import { User } from "src/user/entities/user.entity"
import { TransactionResponse } from "src/helper/enums/TransactionResponse.enum"
import { Transactions } from "src/transactions/entities/transactions.entity"

export interface PaymentDebitDto {
    paiement: Paiement,
    transaction: Transactions,
    reservation: CompteReservation | null,
    amount: string,
    receiverNumber: string,
    senderInfos: User,
    fees: string,
    status: TransactionResponse
}