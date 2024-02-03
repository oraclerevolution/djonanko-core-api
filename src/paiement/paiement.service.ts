import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { HistoriquesService } from 'src/historiques/historiques.service';
import { MakePaiementDto } from './dto/make-paiement.dto';
import { TransactionType } from 'src/historiques/enums/transaction-type.enum';
import { TransactionType as PaiementType } from "src/transfert/enums/transfer-type.enum"
import { CompteCollecteService } from 'src/compte-collecte/compte-collecte.service';
import { CollectType } from 'src/compte-collecte/enums/collect-type.enum';
import { Cron } from '@nestjs/schedule';
import { PaymentInitDto } from './dto/payment-init.dto';
import { User } from 'src/user/entities/user.entity';
import { CompteReservationService } from 'src/compte-reservation/compte-reservation.service';
import { TransactionResponse } from 'src/helper/enums/TransactionResponse.enum';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';
import { PaymentDebitDto } from './dto/payment-debit.dto';
import { PaymentExecDto } from './dto/payment-exec.dto';

@Injectable()
export class PaiementService {
    constructor(
        @InjectRepository(Paiement) private readonly repository: Repository<Paiement>,
        private readonly userService: UserService,
        @Inject(forwardRef(() => HistoriquesService)) private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService,
        private readonly compteReservationService: CompteReservationService,
    ) { }

    /**
     * Initializes a payment with the given payload.
     *
     * @param {MakePaiementDto} payload - The payload containing information about the payment.
     * @returns {Promise<PaymentInitDto>} - A promise that resolves to the initialized payment.
     */
    async paymentInitializer(payload: MakePaiementDto): Promise<PaymentInitDto> {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = payload;
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber);
        const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const paiement = new Paiement();
        paiement.amount = amount;
        if (getSenderInfos.premium === true) {
            paiement.fees = (0.005 * parseInt(amount)).toString();
        } else {
            paiement.fees = (0.01 * parseInt(amount)).toString();
        }
        paiement.amountBeforeSending = getSenderInfos.solde;
        paiement.reference = this.generateReference();
        paiement.amountAfterSending = (balanceAfterSending).toString();
        paiement.senderPhoneNumber = senderPhoneNumber;
        paiement.receiverPhoneNumber = receiverPhoneNumber;

        await this.repository.save(paiement);
        return {
            payment: paiement,
            amount: amount,
            fees: paiement.fees,
            senderInfos: getSenderInfos,
            status: TransactionResponse.SUCCESS,
            receiverNumber: receiverPhoneNumber
        }
    }

    /**
     * Debits the payment from the sender's account and creates a reservation
     * and a collection record.
     *
     * @param {Paiement} paiement - The payment object.
     * @param {string} amount - The amount of the payment.
     * @param {User} senderInfos - Information about the sender.
     * @param {string} fees - The fees associated with the payment.
     * @param {string} receiverNumber - The receiver's phone number.
     * @return {Promise<PaymentDebitDto>} The debit payment DTO.
     */
    async paymentDebit(paiement: Paiement, amount: string, senderInfos: User, fees: string, receiverNumber: string): Promise<PaymentDebitDto> {
        const cost = parseInt(amount) + parseInt(fees);
        const balanceAfterSending = parseInt(senderInfos.solde) - cost;
        await this.userService.updateUser(senderInfos.id, {
            solde: balanceAfterSending.toString(),
        })
        const reservation = await this.compteReservationService.createCompteReservation({
            amount: amount,
            fees: fees,
            transactionStatus: "IN PROGRESS",
            transactionType: TransactionType.PAIEMENT
        })
        await this.compteCollecteService.createCompteCollect({
            amount: fees,
            collectType: CollectType.FRAIS
        })

        return {
            paiement,
            reservation,
            amount,
            receiverNumber,
            senderInfos,
            fees,
            status: TransactionResponse.SUCCESS
        }
    }

    /**
     * Sends a payment from the sender to the receiver.
     *
     * @param {User} senderInfos - The information of the sender.
     * @param {CompteReservation} reservation - The reservation associated with the payment.
     * @param {string} receiverNumber - The phone number of the receiver.
     * @param {string} amount - The amount of the payment.
     * @param {Paiement} paiement - The payment object.
     * @param {string} fees - The fees associated with the payment.
     * @return {Promise<PaymentExecDto>} - The payment execution response.
     */
    async sendPayment(senderInfos: User, reservation: CompteReservation, receiverNumber: string, amount: string, paiement: Paiement, fees: string): Promise<PaymentExecDto> {
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverNumber);
        const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
            solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString()
        })
        if (updateReceiverBalance.affected === 1) {
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: "COMPLETED"
            })
            await this.repository.update(paiement.id, {
                status: PaiementType.SUCCESS
            })
            await this.historiqueService.createHistorique({
                sender: senderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: senderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                referenceTransaction: paiement.reference,
                transactionType: TransactionType.PAIEMENT,
                amount: amount,
                fees: fees,
                status: "SUCCESS",
                icon: 'send'
            })
            return {
                status: TransactionResponse.SUCCESS
            }
        } else {
            await this.repository.update(paiement.id, {
                status: PaiementType.FAILED
            })
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: "FAILED"
            })
            await this.historiqueService.createHistorique({
                sender: senderInfos,
                receiver: getReceiverInfos,
                senderIdentifiant: senderInfos.id,
                receiverIdentifiant: getReceiverInfos.id,
                referenceTransaction: paiement.reference,
                transactionType: TransactionType.PAIEMENT,
                amount: amount,
                fees: fees,
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
            const fees = 0.005 * amount;
            return amount + fees;
        } else {
            const fees = 0.01 * amount;
            return amount + fees;
        }
    }

    /**
     * cron job to debit premium subscription every 28th of the month
     */
    @Cron('0 0 0 28 * *')
    /**
     * Debits premium subscription for all premium users.
     *
     * @return {Promise<void>} Promise that resolves when the operation is complete.
     */
    async debitPremium() {
        console.log('Debiting premium subscription...');
        const getPremiumUsers = await this.userService.getUsersPremiums();
        for (const user of getPremiumUsers) {
            const balanceAfterSending = parseInt(user.solde) - 2000;
            await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString(),
                premiumActivated: true
            })
            await this.historiqueService.createHistorique({
                sender: user,
                receiver: user,
                senderIdentifiant: user.id,
                receiverIdentifiant: user.id,
                transactionType: TransactionType.ABONNEMENT,
                referenceTransaction: "ABONNEMENT",
                amount: "2000",
                fees: "0",
                status: "SUCCESS",
                icon: 'sync'
            })
            await this.compteCollecteService.createCompteCollect({
                amount: "2000",
                collectType: CollectType.ABONNEMENT
            })
        }
    }


    @Cron('0 0 0 27 * *')
    /**
     * Changes the premium status of users.
     *
     * @return {Promise<void>} Returns a promise that resolves when the premium status of all users has been updated.
     */
    async changePremiumStatus() {
        console.log('Changing premium status...');
        const getPremiumUsers = await this.userService.changePremiumStatus();
        for (const user of getPremiumUsers) {
            await this.userService.updateUser(user.id, {
                premiumActivated: false
            })
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

    async getPaymentByReference(reference: string): Promise<Paiement> {
        return await this.repository.findOne({
            where: {
                reference
            }
        })
    }
}
