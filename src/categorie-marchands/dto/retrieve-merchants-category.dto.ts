import { CategorieMarchands } from "../entities/categorie-marchands.entity";

export interface RetrieveMerchantsCategoryDto {
    data: CategorieMarchands[],
    count: number 
}