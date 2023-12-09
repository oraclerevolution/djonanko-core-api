import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Marchands } from './entities/marchands.entity';
import { Repository } from 'typeorm';
import { UpdateMarchandDto } from './dto/update-marchands.dto';

@Injectable()
export class MarchandsService {
    constructor(
        @InjectRepository(Marchands) private readonly repository: Repository<Marchands>,
    ) {}

    /**
     * Creates a new Marchands.
     *
     * @param {Marchands} marchands - The Marchands object to be created.
     * @return {Promise<Marchands>} The created Marchands object.
     */
    async create(
        marchands: Marchands
    ): Promise<Marchands> {
        const marchand = new Marchands();
        marchand.name = marchands.name;
        marchand.logo = marchands.logo;
        marchand.phoneNumber = marchands.phoneNumber;
        marchand.categorieId = marchands.categorieId;
        marchand.IsMatriculeExist = marchands.IsMatriculeExist;
        marchand.textIfMatriculeExist = marchands.textIfMatriculeExist;
        marchand.PaymentNumber = marchands.PaymentNumber;
        return await this.repository.save(marchand);
    }

    /**
     * Retrieves all the Marchands from the repository.
     *
     * @return {Promise<Marchands[]>} A promise that resolves with an array of Marchands.
     */
    async getAll(): Promise<Marchands[]> {
        return await this.repository.find();
    }

    /**
     * Retrieves a single `Marchands` record based on the provided ID.
     *
     * @param {string} id - The ID of the `Marchands` record to retrieve.
     * @return {Promise<Marchands>} - A `Promise` that resolves to the retrieved `Marchands` record.
     */
    async getOne(id: string): Promise<Marchands> {
        return await this.repository.findOne({
            where: {
                id
            }
        });
    }

    /**
     * Updates the payment number of a Marchands record.
     *
     * @param {string} id - The ID of the Marchands record to update.
     * @returns {Promise<Marchands>} - The updated Marchands record.
     */
    async updateMarchandsPaymentNumber(
        id: string,
    ): Promise<Marchands> {
        const marchand = await this.repository.findOne({
            where: {
                id
            }
        });

        const actualPaymentNumber = parseInt(marchand.PaymentNumber);
        marchand.PaymentNumber = (actualPaymentNumber + 1).toString();
        return await this.repository.save(marchand);
    }

    /**
     * Retrieves a list of merchants by category ID.
     *
     * @param {string} id - The ID of the category.
     * @return {Promise<Marchands[]>} - A Promise that resolves to an array of Marchands objects.
     */
    async getMarchantsByCategorieId(
        id: string
    ): Promise<Marchands[]> {
        return await this.repository.find({
            where: {
                categorieId: id
            }
        });
    }

    /**
     * Updates a Marchand entity in the database.
     *
     * @param {string} id - The ID of the Marchand entity to update.
     * @param {UpdateMarchandDto} marchands - The updated Marchand data.
     * @return {Promise<Marchands>} - The updated Marchand entity.
     */
    async update(id: string, marchands: UpdateMarchandDto): Promise<Marchands> {
        return await this.repository.save({
            id,
            ...marchands
        });
    }

    /**
     * Deletes an item with the given ID.
     *
     * @param {string} id - The ID of the item to delete.
     * @return {Promise<void>} - A Promise that resolves when the item is deleted.
     */
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
