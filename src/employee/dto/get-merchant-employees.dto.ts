import { Employee } from "../entities/employee.entity";

export interface GetMerchantEmployeesDto {
    commercants: Employee[],
    count: number
}