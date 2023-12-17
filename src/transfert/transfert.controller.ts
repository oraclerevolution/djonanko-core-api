import { Body, Controller, Post } from '@nestjs/common';
import { TransfertService } from './transfert.service';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { Transfert } from './entities/transfert.entity';
import { User } from 'src/user/entities/user.entity';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';

@Controller('transfert')
export class TransfertController {
    constructor(
        private readonly transfertService: TransfertService
    ) { }

    @Post('initTransfer')
    async initTransfer(
        @Body() payload: MakeTransfertDto
    ) {
        return await this.transfertService.transferInitializer(payload)
    }

    @Post('debitTransfer')
    async debitTransfer(
        @Body() payload: {
            transfer: Transfert
            amount: string
            senderInfos: User
            fees: string
            receiverNumber: string
        }
    ) {
        return await this.transfertService.transferDebit(payload.transfer, payload.amount, payload.senderInfos, payload.fees, payload.receiverNumber)
    }

    @Post('execTransfer')
        async execTransfer(
        @Body() payload: {
            senderInfos: User,
            reservation: CompteReservation,
            receiverNumber: string,
            amount: string,
            transfer: Transfert,
            fees: string
        }
    ){
        return await this.transfertService.sendTransfer(payload.senderInfos, payload.reservation, payload.receiverNumber, payload.amount, payload.transfer, payload.fees)
    }
}
