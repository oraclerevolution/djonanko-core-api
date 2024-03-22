import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { Between, FindConditions, Repository } from 'typeorm';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { HistoriquesService } from 'src/historiques/historiques.service';
import { TransactionType } from 'src/historiques/enums/transaction-type.enum';
import { TransactionType as TransferType } from './enums/transfer-type.enum';
import { CompteCollecteService } from 'src/compte-collecte/compte-collecte.service';
import { CollectType } from 'src/compte-collecte/enums/collect-type.enum';
import { TransactionResponse } from 'src/helper/enums/TransactionResponse.enum';
import { CompteReservationService } from 'src/compte-reservation/compte-reservation.service';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';
import { Historique } from 'src/historiques/entities/historique.entity';
import { HistoriqueFilterDto } from 'src/historiques/dto/historique-filter.dto';
import { ConfigService } from '@nestjs/config';
import { CreateHistoriqueDto, CreateHistoriqueResultDto } from 'src/historiques/dto/create-historique.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Transactions } from 'src/transactions/entities/transactions.entity';

@Injectable()
export class TransfertService {
    constructor(
        @InjectRepository(Transfert) private readonly repository: Repository<Transfert>,
        private readonly userService: UserService,
        private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService,
        private readonly compteReservationService: CompteReservationService,
        private readonly configService: ConfigService,
        private readonly transactionService: TransactionsService
    ) { }

    async transferInitializer(payload: MakeTransfertDto) {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = payload
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber);
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverPhoneNumber);
        if(parseInt(getSenderInfos.solde) < parseInt(amount)){
            const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
            const transfer = new Transfert()
            transfer.amount = amount
            if (getSenderInfos.premium === true) {
                transfer.fees = "0"
            }else{
                transfer.fees = (0.01 * parseInt(amount)).toString()
            }
            transfer.amountBeforeSending = getSenderInfos.solde
            transfer.reference = this.generateReference()
            transfer.amountAfterSending = (balanceAfterSending).toString()
            transfer.senderPhoneNumber = senderPhoneNumber
            transfer.receiverPhoneNumber = receiverPhoneNumber
            transfer.status = TransferType.FAILED

            const transaction = await this.transactionService.createTransaction({
                amount,
                amountBeforeSending: getSenderInfos.solde,
                amountAfterSending: balanceAfterSending.toString(),
                senderPhoneNumber: getSenderInfos.numero,
                reference: transfer.reference,
                receiverPhoneNumber: getReceiverInfos.numero,
                fees: transfer.fees,
                status: "FAILED",
                type: TransactionType.TRANSFERT
            })

            await this.historiqueService.createHistorique({
                sender: getSenderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: getSenderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                transactionType: TransactionType.TRANSFERT,
                referenceTransaction: transfer.reference,
                amount,
                fees: transfer.fees,
                status: "FAILED",
                icon: "send"
            })
            return {
                transfer,
                transaction,
                amount,
                fees: transfer.fees,
                senderInfos: getSenderInfos,
                status: TransactionResponse.INSUFFICIENT_FUNDS
            }
        }else if(parseInt(amount) > getSenderInfos.cumulMensuelRestant){
            const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
            const transfer = new Transfert()
            transfer.amount = amount
            if (getSenderInfos.premium === true) {
                transfer.fees = "0"
            }else{
                transfer.fees = (0.01 * parseInt(amount)).toString()
            }
            transfer.amountBeforeSending = getSenderInfos.solde
            transfer.reference = this.generateReference()
            transfer.amountAfterSending = (balanceAfterSending).toString()
            transfer.senderPhoneNumber = senderPhoneNumber
            transfer.receiverPhoneNumber = receiverPhoneNumber

            const transaction = await this.transactionService.createTransaction({
                amount,
                amountBeforeSending: getSenderInfos.solde,
                amountAfterSending: balanceAfterSending.toString(),
                senderPhoneNumber: getSenderInfos.numero,
                reference: transfer.reference,
                receiverPhoneNumber: getReceiverInfos.numero,
                fees: transfer.fees,
                status: "FAILED",
                type: TransactionType.TRANSFERT
            })

            await this.historiqueService.createHistorique({
                sender: getSenderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: getSenderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                transactionType: TransactionType.TRANSFERT,
                referenceTransaction: transfer.reference,
                amount,
                fees: transfer.fees,
                status: "FAILED",
                icon: "send"
            })

            return {
                transfer,
                transaction,
                amount,
                fees: transfer.fees,
                senderInfos: getSenderInfos,
                status: TransactionResponse.MONTHLY_LIMIT_REACHED
            }
        }else{
            const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
            const transfer = new Transfert()
            transfer.amount = amount
            if (getSenderInfos.premium === true) {
                transfer.fees = "0"
            } else {
                transfer.fees = (0.01 * parseInt(amount)).toString()
            }
            transfer.amountBeforeSending = getSenderInfos.solde
            transfer.reference = this.generateReference()
            transfer.amountAfterSending = (balanceAfterSending).toString()
            transfer.senderPhoneNumber = senderPhoneNumber
            transfer.receiverPhoneNumber = receiverPhoneNumber
            await this.repository.save(transfer)

            let historique: CreateHistoriqueResultDto = null
            let transaction: Transactions = null
            if(transfer){
                transaction = await this.transactionService.createTransaction({
                    amount: amount,
                    amountBeforeSending: transfer.amountBeforeSending,
                    amountAfterSending: transfer.amountAfterSending,
                    senderPhoneNumber: transfer.senderPhoneNumber,
                    reference: transfer.reference,
                    receiverPhoneNumber: transfer.receiverPhoneNumber,
                    fees: transfer.fees,
                    status: "PENDING",
                    type: TransactionType.TRANSFERT,
                })
                historique = await this.createHistorique({
                    sender: getSenderInfos,
                    receiver: getReceiverInfos,
                    senderIdentifiant: getSenderInfos.id,
                    receiverIdentifiant: getReceiverInfos.id,
                    transactionType: TransactionType.TRANSFERT,
                    referenceTransaction: transfer.reference,
                    amount,
                    fees: transfer.fees,
                    status: "PENDING",
                    icon: "send"
                })
                delete(historique.historique.sender)
                delete(historique.historique.receiver)
            }
    
            return {
                transfer,
                amount,
                historique: historique.historique,
                transaction,
                fees: transfer.fees,
                senderInfos: getSenderInfos,
                status: TransactionResponse.SUCCESS,
                receiverNumber: receiverPhoneNumber
            }
        }
    }

    async transferDebit(transfer: Transfert, transaction: Transactions, historique: Historique, amount: string, senderInfos: User, fees: string, receiverNumber: string) {
        const cost = parseInt(amount) + parseInt(fees)
        const balanceAfterSending = parseInt(senderInfos.solde) - cost;
        if(balanceAfterSending < 0){
            await this.repository.update(transfer.id, {
                status: "FAILED"
            })
            await this.transactionService.updateTransaction(transaction.id, {
                status: "FAILED"
            })
            return {
                transfer,
                transaction,
                reservation: null,
                amount,
                receiverNumber,
                senderInfos,
                fees,
                status: TransactionResponse.INSUFFICIENT_FUNDS
            }
        }
        await this.userService.updateUser(senderInfos.id, {
            solde: balanceAfterSending.toString()
        })

        const reservation = await this.compteReservationService.createCompteReservation({
            amount,
            fees,
            fundsToSend: (parseInt(amount) + parseInt(fees)).toString(),
            transactionStatus: "IN PROGRESS",
            transactionType: TransactionType.TRANSFERT
        })
        if(reservation){
            const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
            const balanceAfterSending = parseInt(user.solde) + parseInt(amount) + parseInt(fees);
            const credit = await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString()
            })

            if(credit.affected === 1){
                return {
                    transfer,
                    transaction,
                    reservation,
                    amount,
                    receiverNumber,
                    senderInfos,
                    fees,
                    status: TransactionResponse.SUCCESS
                }
            }else{
                await this.repository.update(transfer.id, {
                    status: "FAILED"
                })
                await this.historiqueService.updateHistorique(historique.id, {
                    status: "FAILED"
                })
                await this.transactionService.updateTransaction(transaction.id, {
                    status: "FAILED"
                })
                return {
                    transfer,
                    reservation,
                    amount,
                    receiverNumber,
                    senderInfos,
                    fees,
                    status: TransactionResponse.INSUFFICIENT_FUNDS
                }
            }
        }
    }

    async sendTransfer(reservation: CompteReservation, receiverNumber: string, amount: string, transfer: Transfert, transaction: Transactions, fees: string, historique: Historique) {
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverNumber);
        const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
            solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString(),
        })
        if (updateReceiverBalance.affected === 1) {
            //debit reservation account
            const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
            const balanceAfterSending = parseInt(user.solde) - parseInt(amount) - parseInt(fees);
            const debit = await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString()
            })
            if(debit.affected === 1){
                const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_COLLECTE'))
                const balanceAfterSending = parseInt(user.solde) + parseInt(fees);
                const credit = await this.userService.updateUser(user.id, {
                    solde: balanceAfterSending.toString()
                })
                if(credit){
                    await this.compteCollecteService.createCompteCollect({
                        amount: fees,
                        collectType: CollectType.FRAIS,
                    })
                    //update reservation status
                    await this.compteReservationService.updateCompteReservation(reservation.id, {
                        transactionStatus: "COMPLETED"
                    })
                    //update transfer status
                    await this.repository.update(transfer.id,{
                        status: TransferType.SUCCESS
                    })
                    //update transaction status
                    await this.transactionService.updateTransaction(transaction.id, {
                        status: "SUCCESS"
                    })
                    //update historique status
                    await this.historiqueService.updateHistorique(historique.id, {
                        status: TransferType.SUCCESS
                    })
                }else{
                    return{
                        status: TransactionResponse.ERROR
                    }
                }

                return {
                    status: TransactionResponse.SUCCESS
                }
            } else{
                await this.repository.update(transfer.id, {
                    status: TransferType.FAILED
                })
                await this.transactionService.updateTransaction(transaction.id, {
                    status: "FAILED"
                })
                return {
                    status: TransactionResponse.ERROR
                }
            }
            
        } else {
            await this.repository.update(transfer.id, {
                status: TransferType.FAILED
            })
            await this.transactionService.updateTransaction(transaction.id, {
                status: "FAILED"
            })
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: TransferType.FAILED
            })
            await this.historiqueService.updateHistorique(historique.id, {
                status: TransferType.FAILED
            })

            return {
                status: TransactionResponse.ERROR
            }
        }
    }

    /**
     * Calculates the transaction fees for a given amount.
     *
     * @param {number} amount - The amount for which to calculate the transaction fees.
     * @return {number} - The total amount including the transaction fees.
     */
    getTransactionFees(amount: number, mode: boolean): number {
        if (mode === true) {
            return amount;
        } else {
            const fees = 0.01 * amount;
            return amount + fees;
        }
    }

    
    /**
     * Generates a random reference string.
     *
     * @return {string} The generated reference string.
     */
    generateReference(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let reference = '';
        for (let i = 0; i < 10; i++) {
            reference += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `DJONANKO-${reference}`;
    }

    async getTransferByReference(reference: string): Promise<Transfert> {
        return await this.repository.findOne({
            where: {
                reference
            }
        })
    }

    async getTransferByReceiverNumber(receiverPhoneNumber: string): Promise<Transfert[]> {
        return await this.repository.find({
            where: {
                receiverPhoneNumber
            }
        })
    }

    /**
     * Create a new historique using the provided data.
     *
     * @param {CreateHistoriqueDto} historique - The data for creating the historique.
     * @return {Promise<CreateHistoriqueResultDto>} The result of the historique creation.
     */
    async createHistorique(historique: CreateHistoriqueDto): Promise<CreateHistoriqueResultDto> {
        const history = await this.historiqueService.createHistorique(historique)
        if (history) {
            return {
                historique: history,
                status: TransactionResponse.SUCCESS
            }
        } else {
            return {
                historique: history,
                status: TransactionResponse.ERROR
            }
        }
    }
}
