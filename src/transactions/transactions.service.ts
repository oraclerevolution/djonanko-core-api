import { Injectable } from '@nestjs/common';
import { Transactions } from './entities/transactions.entity';
import { FindConditions, LessThan, MoreThanOrEqual, Repository, UpdateResult, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { isBefore, isAfter, formatISO } from 'date-fns'
import { Employee } from 'src/employee/entities/employee.entity';
import { GetNewClientDto } from './dto/get-new-client.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions) private readonly repository: Repository<Transactions>,
        private readonly employeeService: EmployeeService,
        private readonly userService: UserService
    ) { }

    /**
     * Create a new transaction.
     *
     * @param {CreateTransactionDto} payload - the transaction data to be created
     * @return {Promise<Transactions>} the created transaction
     */
    async createTransaction(payload: CreateTransactionDto): Promise<Transactions> {
        return await this.repository.save(payload)
    }

    async getNewClients(merchantId: number): Promise<GetNewClientDto> {
        const employees = await this.employeeService.getEmployees(merchantId);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const lastMonth = (currentMonth + 11) % 12;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthStartDate = new Date(lastYear, lastMonth, 1);
        const currentMonthStartDate = new Date(currentYear, currentMonth, 1);
        const transactionsResults = await Promise.all(employees.commercants.map(async (employee) => {
            const lastMonthTransactions = await this.repository.find({
                where: { receiverPhoneNumber: employee.phoneNumber, createdAt: Between(lastMonthStartDate, currentMonthStartDate) },
            });
            const currentMonthTransactions = await this.repository.find({
                where: { receiverPhoneNumber: employee.phoneNumber, createdAt: MoreThanOrEqual(lastMonthStartDate) },
            });
            return {lastMonthTransactions, currentMonthTransactions};
        }));

        const newTransactions = this.findNewsTransactions(transactionsResults[0].lastMonthTransactions, transactionsResults[0].currentMonthTransactions);

        const newUsers = await Promise.all(newTransactions.map(async (transaction) => {
            const user = await this.userService.getUserByPhoneNumber(transaction.senderPhoneNumber);
            return user
        }))

        return { clients: newUsers, count: newUsers.length }

    }

    private findNewsTransactions(lastMonthTransactions: Transactions[], currentMonthTransactions: Transactions[]): Transactions[] {
        // Créer un ensemble contenant les numéros de téléphone des transactions dans le tableau A
        const lastMonthNumber = new Set(lastMonthTransactions.map(transaction => transaction.senderPhoneNumber));
    
        // Filtrer les transactions dans le tableau B qui ne sont pas dans le tableau A
        const newTransactions = currentMonthTransactions.filter(transaction => !lastMonthNumber.has(transaction.senderPhoneNumber));
    
        return newTransactions;
    }

    async getUserTransactions(userNumber: string): Promise<Transactions[]> {
        const transactions = await this.repository.createQueryBuilder('transactions')
            .where('transactions.receiverPhoneNumber = :receiverPhoneNumber', { receiverPhoneNumber: userNumber })
            .orWhere('transactions.senderPhoneNumber = :senderPhoneNumber', { senderPhoneNumber: userNumber })
            .getMany()

        return transactions
    }

    async updateTransactionStatusToFailed(updateTransactionDto: Partial<Transactions>): Promise<UpdateResult> {
        return await this.repository.update(updateTransactionDto.id, {
            status: "FAILED"
        })
    }

    async updateTransactionStatusToSuccess(updateTransactionDto: Partial<Transactions>): Promise<UpdateResult> {
        return await this.repository.update(updateTransactionDto.id, {
            status: "SUCCESS"
        })
    }
}
