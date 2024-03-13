import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { MakePaiementDto } from './dto/make-paiement.dto';
import { PaymentExecDto } from './dto/payment-exec.dto';
import { PaymentInitDto } from './dto/payment-init.dto';
import { Paiement } from './entities/paiement.entity';
import { User } from 'src/user/entities/user.entity';
import { PaymentDebitDto } from './dto/payment-debit.dto';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ValidatePaymentDto } from './dto/validate-payment.dto';
import { MakeAbonnementDto } from './dto/abonnement.dto';
import { Historique } from 'src/historiques/entities/historique.entity';

@UseGuards(FullAuthGuard)
@Controller('paiement')
export class PaiementController {
    constructor(
        private readonly paiementService: PaiementService
    ) {}

    @Post('initPayment')
    async initPayment(
        @Body() payload: MakePaiementDto
    ): Promise<PaymentInitDto> {
        return await this.paiementService.paymentInitializer(payload)
    }

    @Post('debitPayment')
    async debitPayment(
        @Body() payload: {
            paiement: Paiement
            amount: string
            senderInfos: User
            fees: string
            receiverNumber: string
        }
    ): Promise<PaymentDebitDto> {
        return await this.paiementService.paymentDebit(payload.paiement, payload.amount, payload.senderInfos, payload.fees, payload.receiverNumber)
    }

    @Post('execPayment')
    async execPayment(
        @Body() payload: {
            senderInfos: User, 
            reservation:CompteReservation, 
            receiverNumber: string, 
            amount: string, 
            paiement: Paiement, 
            fees: string,
            abonnement?:boolean,
            historique: Historique
        }
    ){
        return await this.paiementService.sendPayment(payload.senderInfos, payload.reservation, payload.receiverNumber, payload.amount, payload.paiement, payload.fees, payload.historique )
    }

    @Get('paiementByReference')
    async getPaiementByReference(
        @Query('reference') reference: string
    ){
        return await this.paiementService.getPaymentByReference(reference)
    }

    @Post('create_payment_request')
    async createPaymentRequest(
        @Body() payload: PaymentRequestDto
    ){
        return await this.paiementService.paymentRequest(payload)
    }

    @Post('validate-payment-request')
    async validatePaymentRequest(
        @Body() payload: ValidatePaymentDto
    ){
        return await this.paiementService.validatePaymentRequest(payload)
    }

    @Get('all-pending-payment-for-a-merchant')
    async getAllPendingPaymentForAMerchant(
        @Query('receiverPhoneNumber') receiverPhoneNumber: string
    ){
        return await this.paiementService.getAllPendingPaymentForAMerchant(receiverPhoneNumber)
    }

    @Post('make-subscription')
    async makeAbonnement(
        @Body() payload: MakeAbonnementDto
    ){
        return await this.paiementService.makeAbonnement(payload)
    }
}
