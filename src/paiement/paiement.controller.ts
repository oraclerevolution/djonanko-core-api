import { Body, Controller, Post } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { Paiement } from './entities/paiement.entity';
import { MakePaiementDto } from './dto/make-paiement.dto';

@Controller('paiement')
export class PaiementController {
    constructor(
        private readonly paiementService: PaiementService
    ) {}

    @Post()
    async makePaiement(
        @Body() payload: MakePaiementDto
    ): Promise<Paiement> {
        return await this.paiementService.makePaiement(payload)
    }
}
