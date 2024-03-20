import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransfertService } from './transfert.service';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { Transfert } from './entities/transfert.entity';
import { User } from 'src/user/entities/user.entity';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { Historique } from 'src/historiques/entities/historique.entity';
import { Transactions } from 'src/transactions/entities/transactions.entity';

@UseGuards(FullAuthGuard)
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
            transaction: Transactions
            historique: Historique
            amount: string
            senderInfos: User
            fees: string
            receiverNumber: string
        }
    ) {
        return await this.transfertService.transferDebit(payload.transfer, payload.transaction, payload.historique, payload.amount, payload.senderInfos, payload.fees, payload.receiverNumber)
    }

    @Post('execTransfer')
        async execTransfer(
        @Body() payload: {
            reservation: CompteReservation,
            receiverNumber: string,
            amount: string,
            transfer: Transfert,
            transaction: Transactions
            fees: string,
            historique: Historique
        }
    ){
        return await this.transfertService.sendTransfer(payload.reservation, payload.receiverNumber, payload.amount, payload.transfer, payload.transaction, payload.fees, payload.historique)
    }

    @Get('transferByReference')
    async getTransferByReference(
        @Query('reference') reference: string
    ){
        return await this.transfertService.getTransferByReference(reference)
    }
}
