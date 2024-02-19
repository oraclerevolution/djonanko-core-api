import { BadRequestException, Injectable } from '@nestjs/common';
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
        pointofsale.communeName = payload.communeName;
        return await this.Posrepository.save(pointofsale);
    }

    async searchPosByCommune(communeName: string): Promise<Pos[]> {
        const allCommunes = await this.communesRepository.find();
        console.log("allCommunes", allCommunes);
        //appliquer un filtre pour rechercher le nom de la commune saisi par le user
        const filteredCommunes = allCommunes.filter((commune) => commune.name === communeName.toLocaleLowerCase());

        console.log("filteredCommunes", filteredCommunes);

        if(filteredCommunes.length === 0) {
            throw new BadRequestException("Il se peut que cette commune n'existe pas");
        }else{
            const search = await this.Posrepository.find({
                where: {
                    communeName: filteredCommunes[0].id
                }
            })

            if(search.length === 0) {
                throw new BadRequestException("Nous n'avons pas de point de vente dans cette commune");
            }else{
                return search;
            }
        }
        
    }

    async getAllCommune(): Promise<Communes[]> {
        return await this.communesRepository.find()
    }
}
