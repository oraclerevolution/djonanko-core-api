import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee) private readonly repository: Repository<Employee>,
        private readonly userService: UserService,
        private readonly paiementService: PaiementService,
        private readonly transfertService: TransfertService
    ) {}

    async create(payload: CreateEmployeeDto, user: User): Promise<Employee> {
        const { phoneNumber, address } = payload;
        const getUser = await this.userService.getUserByPhoneNumber(phoneNumber);
        if(!getUser) throw new BadRequestException("Ce numéro n'est pas valide");
        const employee = new Employee();
        employee.fullname = getUser.fullname
        employee.phoneNumber = phoneNumber
        employee.userid = user.id
        employee.email = getUser.email
        employee.address = address

        const createdEmployee = await this.repository.save(employee);

        if(createdEmployee){
            await this.userService.updateUser(getUser.id, {
                userType: UserType.COMMERCANT
            })
        }

        return createdEmployee
    }

    async getEmployees (
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

    async getMerchantEmployee(merchantId: number): Promise<Employee[]>{
        //ici le merchantId n'est pas celui de la table marchands mais de la table user
        const employees = await this.repository.find({
            where:{
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
