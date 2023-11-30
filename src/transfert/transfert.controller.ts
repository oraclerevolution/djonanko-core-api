import { Body, Controller, Post } from '@nestjs/common';
import { TransfertService } from './transfert.service';
import { MakeTransfertDto } from './dto/make-transfert.dto';
import { Transfert } from './entities/transfert.entity';

@Controller('transfert')
export class TransfertController {
    constructor(
        private readonly transfertService: TransfertService
    ){}

    @Post('send-djonanko')
    async makeTransfert(
        @Body() payload: MakeTransfertDto
    ): Promise<Transfert> {
        return await this.transfertService.makeTransfert(payload)
    }
}
