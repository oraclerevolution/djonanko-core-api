import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { GetMerchantEmployeesDto } from './dto/get-merchant-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee) private readonly repository: Repository<Employee>,
        private readonly userService: UserService
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

        return await this.repository.save(employee);
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

    async update(id: string, payload: UpdateEmployeeDto): Promise<Employee> {
        await this.repository.update(id, payload);
        return await this.repository.findOne(id);
    }
    
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
