import { Injectable } from '@nestjs/common';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly usersService: UserService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async getAllUsers(): Promise<number> {
    const users = await this.usersService.getAllUsers();
    return users.length;
  }

  async getActiveUsers(): Promise<User[]> {
    const allUsers = await this.usersService.getAllUsers();
    const activeUsers: User[] = [];
    allUsers.forEach(async (user) => {
      const userTransactions =
        await this.transactionsService.getUserTransactions(user.numero);
      if (userTransactions.length > 5) {
        activeUsers.push(user);
      }
    });

    return activeUsers;
  }
}
