import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pos } from './entities/pos.entity';
import { Repository } from 'typeorm';
import { Communes } from './entities/communes.entity';
import { CreateCommuneDto } from './dto/create-commune.dto';
import { CreatePosDto } from './dto/create-pos.dto';

@Injectable()
export class PosService {
    constructor(
        @InjectRepository(Pos) private readonly Posrepository: Repository<Pos>,
        @InjectRepository(Communes) private readonly communesRepository: Repository<Communes>,
    ) {}

    async createCommunes(payload: CreateCommuneDto): Promise<Communes> {

        const commune = new Communes();
        commune.name = payload.name;
        return await this.communesRepository.save(commune);
    }

    async create(
        payload: CreatePosDto
    ): Promise<Pos> {
        const pointofsale = new Pos();
        pointofsale.phoneNumber = payload.phoneNumber;
        pointofsale.address = payload.address;
        pointofsale.openHours = payload.openHours;
        pointofsale.closeHours = payload.closeHours;
        pointofsale.communeId = payload.communeId;
        return await this.Posrepository.save(pointofsale);
    }

    async searchPosByCommune(communeName: string): Promise<Pos[]> {
        const allCommunes = await this.communesRepository.find();
        //appliquer un filtre pour rechercher le nom de la commune saisi par le user
        const filteredCommunes = allCommunes.filter(commune => {
            if (commune.name === communeName) {
                return commune
            }else{
                return{
                    message:"Désolé, nous n'avons pas de point de vente dans cette commune !"
                }
            }
        })
        return await this.Posrepository.find({
            where: {
                communeId: filteredCommunes[0].id
            }
        })
    }

    async getACommune(name: string): Promise<Communes> {
        return await this.communesRepository.findOne({
            where: {
                name
            }
        })
    }
}
