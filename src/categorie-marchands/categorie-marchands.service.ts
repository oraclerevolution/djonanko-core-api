import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategorieMarchands } from './entities/categorie-marchands.entity';
import { Repository } from 'typeorm';
import { UpdateCategorieMarchandsDto } from './dto/update-categorie-marchands.dto';
import { RetrieveMerchantsCategoryDto } from './dto/retrieve-merchants-category.dto';

@Injectable()
export class CategorieMarchandsService {
    constructor(
        @InjectRepository(CategorieMarchands) private readonly repository: Repository<CategorieMarchands>,
    ) {}

    /**
     * Creates a new CategorieMarchands object.
     *
     * @param {CategorieMarchands} categorieMarchands - The CategorieMarchands object to be created.
     * @return {Promise<CategorieMarchands>} - The newly created CategorieMarchands object.
     */
    async create(categorieMarchands: CategorieMarchands): Promise<CategorieMarchands> {
        return await this.repository.save(categorieMarchands);
    }

    /**
     * Retrieves all the CategorieMarchands from the repository.
     *
     * @return {Promise<CategorieMarchands[]>} A promise that resolves to an array of CategorieMarchands.
     */
    async getAll(): Promise<RetrieveMerchantsCategoryDto> {
        const [data, count] = await this.repository.findAndCount();
        return {
            data,
            count
        }
    }

    /**
     * Retrieves a single record from the database based on the provided ID.
     *
     * @param {string} id - The ID of the record to retrieve.
     * @return {Promise<CategorieMarchands>} A promise that resolves to the retrieved record.
     */
    async getOne(id: string): Promise<CategorieMarchands> {
        return await this.repository.findOne({
            where: {
                id
            }
        });
    }

    /**
     * Updates a CategorieMarchands object in the database.
     *
     * @param {string} id - The id of the object to update.
     * @param {UpdateCategorieMarchandsDto} categorieMarchands - The updated CategorieMarchands object.
     * @return {Promise<CategorieMarchands>} - The updated CategorieMarchands object.
     */
    async update(id: string, categorieMarchands: UpdateCategorieMarchandsDto): Promise<CategorieMarchands> {
        return await this.repository.save({
            id,
            ...categorieMarchands
        });
    }

    /**
     * Deletes an item with the given ID.
     *
     * @param {string} id - The ID of the item to delete.
     * @return {Promise<void>} A promise that resolves when the item is deleted.
     */
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
