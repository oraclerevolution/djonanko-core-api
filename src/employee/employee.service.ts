import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { GetMerchantEmployeesDto } from './dto/get-merchant-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaiementService } from 'src/paiement/paiement.service';
import { TransfertService } from 'src/transfert/transfert.service';
import { EmployeeActivityDto } from './dto/employeeActivity.dto';
import { UserType } from 'src/user/enums/user-type.enum';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { DailyTransactionsReturnDto } from './dto/daily-transactions-return.dto';
import { GetEmployeeTotalAmountReturnDto } from './dto/get-employee-total-amount-return.dto';
import { Transfert } from 'src/transfert/entities/transfert.entity';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee) private readonly repository: Repository<Employee>,
        private readonly userService: UserService,
        private readonly paiementService: PaiementService,
        private readonly transfertService: TransfertService
    ) { }

    async create(payload: CreateEmployeeDto, user: User): Promise<Employee> {
        const { phoneNumber, address } = payload;
        const getUser = await this.userService.getUserByPhoneNumber(phoneNumber);
        if (!getUser) throw new BadRequestException("Ce numéro n'est pas valide");
        const employee = new Employee();
        employee.fullname = getUser.fullname
        employee.phoneNumber = phoneNumber
        employee.userid = user.id
        employee.email = getUser.email
        employee.address = address

        const createdEmployee = await this.repository.save(employee);

        if (createdEmployee) {
            await this.userService.updateUser(getUser.id, {
                userType: UserType.COMMERCANT
            })
        }

        return createdEmployee
    }

    async getEmployees(
        merchantId: string,
    ): Promise<GetMerchantEmployeesDto> {
        const [commercants, count] = await this.repository.findAndCount({
            where: {
                userid: merchantId
            }
        });
        return { commercants, count };
    }

    async blockEmployee(id: number): Promise<void> {
        await this.userService.updateUser(id, { isActive: false });
    }

    async getAnEmployeeActivity(id: string): Promise<EmployeeActivityDto> {
        const employee = await this.repository.findOne(id);
        const employeePaiements = await this.paiementService.getPaiementByReceiverNumber(employee.phoneNumber);
        const employeeTransferts = await this.transfertService.getTransferByReceiverNumber(employee.phoneNumber);
        const paymentTotal = employeePaiements.reduce((total, paiement) => total + parseInt(paiement.amount), 0);
        const transfertTotal = employeeTransferts.reduce((total, transfert) => total + parseInt(transfert.amount), 0);

        return {
            paiements: employeePaiements,
            transferts: employeeTransferts,
            totalPaiement: paymentTotal,
            totalTransfert: transfertTotal
        };
    }


    async getAllEmployeesActivity(merchantId: number): Promise<GetEmployeeTotalAmountReturnDto> {
        const employees = await this.repository.find({
            where: {
                userid: merchantId
            }
        });

        if (!employees || employees.length === 0) {
            throw new NotFoundException('Ce marchand n\'a pas d\'employés');
        }

        let totalAmount = 0;
        let totalTransaction = 0;

        for (const employee of employees) {
            const user = await this.userService.getUserByPhoneNumber(employee.phoneNumber);

            if (!user) {
                throw new NotFoundException(`User not found for employee with ID ${employee.id}`);
            }

            const payments = await this.paiementService.getPaiementByReceiverNumber(user.numero);
            for (const payment of payments) {
                if(payment.status === "SUCCESS") totalTransaction += 1;
            }
            const transfers = await this.transfertService.getTransferByReceiverNumber(user.numero);
            for (const transfer of transfers) {
                if(transfer.status === "SUCCESS") totalTransaction += 1;
            }

            for (const payment of payments) {
                totalAmount += parseInt(payment.amount);
            }

            for (const transfer of transfers) {
                totalAmount += parseInt(transfer.amount);
            }

        }

        return {
            merchantId,
            totalAmount,
            totalTransaction
        }
    }

    async calculateDailyTransactions(merchantId: number): Promise<DailyTransactionsReturnDto[]> {
        // const operations = await this.getAnEmployeeActivity(employeeId);
        //je recupère tous les employés du marchands
        const employees = await this.repository.find({
            where: {
                userid: merchantId
            }
        });

        let allPayment: Paiement[] = [];
        let allTransfert: Transfert[] = [];
        for (const employee of employees) {
            const paiements = await this.paiementService.getPaiementByReceiverNumber(employee.phoneNumber);
            const transferts = await this.transfertService.getTransferByReceiverNumber(employee.phoneNumber);
            if(paiements.length > 0) allPayment.push(...paiements);
            if(transferts.length > 0) allTransfert.push(...transferts);
        }

        const transactions = allPayment.concat(allTransfert);
        const dailyTransactionsMap = new Map<string, number>(); // Utilisation d'une map pour stocker les totaux par jour

        for (const transaction of transactions) {
            const transactionDate = new Date(transaction.createdAt).toDateString(); // Obtention de la date de la transaction (sans l'heure)
            const transactionAmount = parseFloat(transaction.amount); // Conversion du montant en nombre

            if (dailyTransactionsMap.has(transactionDate)) {
                // Si la date existe déjà dans la map, ajoute le montant à son total
                const currentTotal = dailyTransactionsMap.get(transactionDate) || 0;
                dailyTransactionsMap.set(transactionDate, currentTotal + transactionAmount);
            } else {
                // Si la date n'existe pas encore dans la map, initialise le total à ce montant
                dailyTransactionsMap.set(transactionDate, transactionAmount);
            }
        }

        // Conversion de la map en un tableau d'objets DailyTransactionsDto
        const dailyTransactionsList: DailyTransactionsReturnDto[] = [];
        for (const [date, amount] of dailyTransactionsMap.entries()) {
            dailyTransactionsList.push({ date: new Date(date), amount });
        }

        return dailyTransactionsList;
    }

    async getMerchantEmployee(merchantId: number): Promise<Employee[]> {
        //ici le merchantId n'est pas celui de la table marchands mais de la table user
        const employees = await this.repository.find({
            where: {
                userid: merchantId
            }
        })

        return employees
    }

    async update(id: string, payload: UpdateEmployeeDto): Promise<Employee> {
        await this.repository.update(id, payload);
        return await this.repository.findOne(id);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
