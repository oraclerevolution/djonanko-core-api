import { Injectable } from '@nestjs/common';
import { Transactions } from './entities/transactions.entity';
import { FindConditions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EmployeeService } from 'src/employee/employee.service';
import {isBefore, isAfter, formatISO} from 'date-fns'
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions) private readonly repository: Repository<Transactions>,
        private readonly employeeService: EmployeeService
    ){}

    /**
     * Create a new transaction.
     *
     * @param {CreateTransactionDto} payload - the transaction data to be created
     * @return {Promise<Transactions>} the created transaction
     */
    async createTransaction(payload: CreateTransactionDto): Promise<Transactions>{
        return await this.repository.save(payload)
    }

    async getNewClients(id: string): Promise<any>{
        //recuperer les employées du marchand
        const merchantEmployees = await this.employeeService.getEmployees(id)

        //recuperer les transactions du mois précédent et du mois actuel implquant les employés du marchand
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthStartDate = new Date(lastYear, lastMonth, 1);
        const currentMonthStartDate = new Date(currentYear, currentMonth, 1);

        const lastMonthTransactions = await this.repository.find({
            where: {
                receiverPhoneNumber: merchantEmployees.commercants.map(employee => employee.phoneNumber),
                // createdAt:{
                //     gte: formatISO(lastMonthStartDate),
                //     lte: formatISO(currentMonthStartDate)
                // }
            }
        })

        const currentMonthTransactions = await this.repository.find({
            where: {
                receiverPhoneNumber: merchantEmployees.commercants.map(employee => employee.phoneNumber),
                // createdAt:{
                //     gte: formatISO(currentMonthStartDate)
                // }
            }
        })
        const allTransactions = [...lastMonthTransactions, ...currentMonthTransactions];
        return allTransactions

        // //recuperer les IDs uniques des clients qui ont envoyé de l'argent aux employés du marchand
        // const uniqueClientIds = new Set();
        // allTransactions.forEach(transaction => {
        //     if(transaction.id){
        //         uniqueClientIds.add(transaction.id)
        //     }
        // })
        // //recuperer les details des nouveaux clients a partir de leur IDs
        // const uniqueClientIdsArray = Array.from(uniqueClientIds);
        // const newClients = await this.

        // return {
        //     clients: 
        // }
    }
}
