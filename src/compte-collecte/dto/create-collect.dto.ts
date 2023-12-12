import { CompteCollect } from "../entities/compte-collect.entity";

export type CreateCollectDto = Omit<CompteCollect, 'id' | 'createdAt' | 'updatedAt'>