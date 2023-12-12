import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompteCollect } from './entities/compte-collect.entity';
import { Repository } from 'typeorm';
import { CreateCollectDto } from './dto/create-collect.dto';

@Injectable()
export class CompteCollecteService {
    constructor(
        @InjectRepository(CompteCollect) private readonly repository: Repository<CompteCollect>,
    ){}

    createCompteCollect(compteCollect: CreateCollectDto): Promise<CompteCollect> {
        return this.repository.save(compteCollect);
    }
}
