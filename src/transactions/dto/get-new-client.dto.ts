import { User } from "src/user/entities/user.entity";

export interface GetNewClientDto {
    clients: User[],
    count: number
}