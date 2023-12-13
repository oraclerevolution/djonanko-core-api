import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { HistoriquesService } from 'src/historiques/historiques.service';
import { MakePaiementDto } from './dto/make-paiement.dto';
import { TransactionType } from 'src/historiques/enums/transaction-type.enum';
import { CompteCollecteService } from 'src/compte-collecte/compte-collecte.service';
import { CollectType } from 'src/compte-collecte/enums/collect-type.enum';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PaiementService {
    constructor(
        @InjectRepository(Paiement) private readonly repository: Repository<Paiement>,
        private readonly userService: UserService,
        private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService
    ) { }

    /**
     * Performs a payment transaction.
     *
     * @param {MakePaiementDto} payload - The payment details.
     * @return {Promise<any>} The result of the payment transaction.
     */
    async makePaiement(payload: MakePaiementDto): Promise<any> {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = payload;
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber);
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverPhoneNumber);
        const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const paiement = new Paiement();
        paiement.amount = amount;
        if (getSenderInfos.premium === true) {
            paiement.fees = (0.005 * parseInt(amount)).toString();
        } else {
            paiement.fees = (0.01 * parseInt(amount)).toString();
        }
        paiement.amountBeforeSending = getSenderInfos.solde;
        paiement.amountAfterSending = (balanceAfterSending).toString();
        paiement.senderPhoneNumber = senderPhoneNumber;
        paiement.receiverPhoneNumber = receiverPhoneNumber;

        const updateSenderBalance = await this.userService.updateUser(getSenderInfos.id, {
            solde: balanceAfterSending.toString()
        })

        const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
            solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString()
        })

        if (updateSenderBalance.affected === 1 && updateReceiverBalance.affected === 1) {
            const createPaiement = await this.repository.save(paiement);
            if (createPaiement) {
                await this.historiqueService.createHistorique({
                    sender: getSenderInfos,
                    receiver: getReceiverInfos,
                    transactionType: TransactionType.PAIEMENT,
                    amount: amount,
                    icon: 'send'
                })
                await this.compteCollecteService.createCompteCollect({
                    amount: getSenderInfos.premium === true ? (0.005 * parseInt(amount)).toString() : (0.01 * parseInt(amount)).toString(),
                    collectType: CollectType.FRAIS
                })
                return createPaiement
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
                transactionType: TransactionType.ABONNEMENT,
                amount: "2000",
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
}
