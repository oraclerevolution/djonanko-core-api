import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Historique } from './entities/historique.entity';
import { Repository } from 'typeorm';
import { CreateHistoriqueDto } from './dto/create-historique.dto';

@Injectable()
export class HistoriquesService {
    constructor(
        @InjectRepository(Historique) private readonly repository: Repository<Historique>,
    ){}

    async createHistorique(historique: CreateHistoriqueDto): Promise<Historique> {
        return await this.repository.save(historique)
    }

    async getAUserHistorique(id: number): Promise<Historique[]> {
        return await this.repository
            .createQueryBuilder("historique")
            .where("historique.sender = :sender", {sender: id})
            .getMany()
    }
}
