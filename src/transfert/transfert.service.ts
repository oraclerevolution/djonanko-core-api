import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfert } from './entities/transfert.entity';
import { Repository } from 'typeorm';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TransfertService {

    constructor(
        @InjectRepository(Transfert) private readonly repository: Repository<Transfert>,
        private readonly userService: UserService
    ) {}

    /**
     * Makes a transfer with the provided payload.
     *
     * @param {MakeTransfertDto} payload - The transfer payload containing senderPhoneNumber,
     * receiverPhoneNumber, and amount.
     * @return {Promise<any>} - A promise that resolves to the result of the transfer.
     */
    async makeTransfert(payload: MakeTransfertDto): Promise<any> {
        const {senderPhoneNumber, receiverPhoneNumber, amount} = payload
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber)
        const balanceAfterSending = parseInt(getSenderInfos.solde) - parseInt(amount)
        const transfert = new Transfert()
        transfert.amount = amount
        transfert.amountBeforeSending = getSenderInfos.solde
        transfert.amountAfterSending = (balanceAfterSending).toString()
        transfert.senderPhoneNumber = senderPhoneNumber
        transfert.receiverPhoneNumber = receiverPhoneNumber

        const updateSenderBalance = await this.userService.updateUser(getSenderInfos.id, {
            solde: balanceAfterSending.toString()
        })

        if(updateSenderBalance.affected !== 0) {
            return await this.repository.save(transfert)
        }
    }
}
