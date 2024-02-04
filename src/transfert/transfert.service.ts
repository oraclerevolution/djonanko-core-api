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

@Injectable()
export class TransfertService {
    constructor(
        @InjectRepository(Transfert) private readonly repository: Repository<Transfert>,
        private readonly userService: UserService,
        private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService,
        private readonly compteReservationService: CompteReservationService
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
            return {
                transfer,
                amount,
                fees: transfer.fees,
                senderInfos: getSenderInfos,
                status: TransactionResponse.SUCCESS,
                receiverNumber: receiverPhoneNumber
            }
        }
    }

    async transferDebit(transfer: Transfert, amount: string, senderInfos: User, fees: string, receiverNumber: string) {
        const cost = parseInt(amount) + parseInt(fees)
        const balanceAfterSending = parseInt(senderInfos.solde) - cost;
        await this.userService.updateUser(senderInfos.id, {
            solde: balanceAfterSending.toString()
        })
        const reservation = await this.compteReservationService.createCompteReservation({
            amount,
            fees,
            transactionStatus: "IN PROGRESS",
            transactionType: TransactionType.TRANSFERT
        })
        await this.compteCollecteService.createCompteCollect({
            amount: fees,
            collectType: CollectType.FRAIS
        })

        return {
            transfer,
            reservation,
            amount,
            receiverNumber,
            senderInfos,
            fees,
            status: TransactionResponse.SUCCESS
        }
    }

    async sendTransfer(senderInfos: User, reservation: CompteReservation, receiverNumber: string, amount: string, transfer: Transfert, fees: string) {
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverNumber);
        const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
            solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString(),
        })
        if (updateReceiverBalance.affected === 1) {
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: "COMPLETED"
            })
            await this.repository.update(transfer.id, {
                status: TransferType.SUCCESS
            })
            await this.userService.updateUser(senderInfos.id, {
                cumulMensuelRestant: getReceiverInfos.cumulMensuelRestant - parseInt(amount)
            })
            await this.historiqueService.createHistorique({
                sender: senderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: senderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                transactionType: TransactionType.TRANSFERT,
                referenceTransaction: transfer.reference,
                amount,
                fees,
                status: "SUCCESS",
                icon: "send"
            })
            await this.historiqueService.createHistorique({
                sender: senderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: senderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                transactionType: TransactionType.TRANSFERT,
                referenceTransaction: transfer.reference,
                amount,
                fees,
                status: "SUCCESS",
                icon: "arrow-down"
            })
            return {
                status: TransactionResponse.SUCCESS
            }
        } else {
            await this.repository.update(transfer.id, {
                status: TransferType.FAILED
            })
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: "FAILED"
            })
            await this.historiqueService.createHistorique({
                sender: senderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: senderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                transactionType: TransactionType.TRANSFERT,
                referenceTransaction: transfer.reference,
                amount,
                fees,
                status: "FAILED",
                icon: 'send'
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
}
