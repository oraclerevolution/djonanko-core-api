import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { Repository } from 'typeorm';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { HistoriquesService } from 'src/historiques/historiques.service';
import { TransactionType } from 'src/historiques/enums/transaction-type.enum';
import { CompteCollecteService } from 'src/compte-collecte/compte-collecte.service';
import { CollectType } from 'src/compte-collecte/enums/collect-type.enum';

@Injectable()
export class TransfertService {
    constructor(
        @InjectRepository(Transfert) private readonly repository: Repository<Transfert>,
        private readonly userService: UserService,
        private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService
    ) { }

    /**
     * Makes a transfer with the provided payload.
     *
     * @param {MakeTransfertDto} payload - The transfer payload containing senderPhoneNumber,
     * receiverPhoneNumber, and amount.
     * @return {Promise<any>} - A promise that resolves to the result of the transfer.
     */
    async makeTransfert(payload: MakeTransfertDto): Promise<Transfert> {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = payload
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber)
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverPhoneNumber)
        if(getReceiverInfos){
            const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium)
            const transfert = new Transfert()
            transfert.amount = amount
            if (getSenderInfos.premium === true) {
                transfert.fees = "0"
            } else {
                transfert.fees = (0.01 * parseInt(amount)).toString()
            }
            transfert.amountBeforeSending = getSenderInfos.solde
            transfert.amountAfterSending = (balanceAfterSending).toString()
            transfert.senderPhoneNumber = senderPhoneNumber
            transfert.receiverPhoneNumber = receiverPhoneNumber
    
            const updateSenderBalance = await this.userService.updateUser(getSenderInfos.id, {
                solde: balanceAfterSending.toString()
            })
    
            const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
                solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString()
            })
    
            if (updateSenderBalance.affected === 1 && updateReceiverBalance.affected === 1) {
                const createTransfert = await this.repository.save(transfert)
                if (createTransfert) {
                    await this.historiqueService.createHistorique({
                        sender: getSenderInfos,
                        receiver: getReceiverInfos,
                        transactionType: TransactionType.TRANSFERT,
                        amount: amount,
                        icon: 'send'
                    })
                    await this.compteCollecteService.createCompteCollect({
                        amount: getSenderInfos.premium === true ? (parseInt(amount)).toString() : (0.01 * parseInt(amount)).toString(),
                        collectType: CollectType.FRAIS
                    })
                    return createTransfert
                }
            }
        }else{
            throw new NotFoundException("Le destinataire n'as pas de compte djonanko")
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
}
