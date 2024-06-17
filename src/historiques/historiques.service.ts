import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Historique } from './entities/historique.entity';
import { Between, Repository, FindConditions } from 'typeorm';
import { CreateHistoriqueDto } from './dto/create-historique.dto';
import { GetHistoriqueFilterDto } from './dto/get-historique-filter.dto';
import { HistoriqueFilterDto } from './dto/historique-filter.dto';
import { PaiementService } from 'src/paiement/paiement.service';
import { TransfertService } from 'src/transfert/transfert.service';
import { UserService } from 'src/user/user.service';
import { UpdateHistoriqueDto } from './dto/update-historique.dto';

@Injectable()
export class HistoriquesService {
  constructor(
    @InjectRepository(Historique)
    private readonly repository: Repository<Historique>,
    @Inject(forwardRef(() => PaiementService))
    private readonly paiementService: PaiementService,
    @Inject(forwardRef(() => TransfertService))
    private readonly transferService: TransfertService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new historique entry in the database.
   *
   * @param {CreateHistoriqueDto} historique - The historique object to be created.
   * @return {Promise<Historique>} - The newly created historique object.
   */
  async createHistorique(historique: CreateHistoriqueDto): Promise<Historique> {
    return await this.repository.save(historique);
  }

  /**
   * Retrieves the historical data for a specific user.
   *
   * @param {number} id - The ID of the user.
   * @return {Promise<Historique[]>} An array of historical data for the user.
   */
  async getAUserHistorique(id: number): Promise<Historique[]> {
    const sendingTransactions = await this.repository
      .createQueryBuilder('historique')
      .where('historique.sender = :sender', { sender: id })
      .limit(6)
      .orderBy('historique.createdAt', 'DESC')
      .getMany();

    const receivingTransactions = await this.repository
      .createQueryBuilder('historique')
      .where('historique.receiver = :receiver', { receiver: id })
      .limit(6)
      .orderBy('historique.createdAt', 'DESC')
      .getMany();

    return sendingTransactions.concat(receivingTransactions);
  }

  /**
   * Retrieves all historiques.
   *
   * @return {Promise<Historique[]>} A promise that resolves to an array of Historique objects.
   */
  async getAllHistoriques(id: number): Promise<Historique[]> {
    const sendingTransactions = await this.repository
      .createQueryBuilder('historique')
      .where('historique.sender = :sender', { sender: id })
      .orderBy('historique.createdAt', 'DESC')
      .getMany();

    const receivingTransactions = await this.repository
      .createQueryBuilder('historique')
      .where('historique.receiver = :receiver', { receiver: id })
      .limit(6)
      .orderBy('historique.createdAt', 'DESC')
      .getMany();

    return sendingTransactions.concat(receivingTransactions);
  }

  async getTransfertHistoriqueFilters(
    options: GetHistoriqueFilterDto,
  ): Promise<HistoriqueFilterDto> {
    let didUpdateFilters = false;
    const where: FindConditions<Historique> = {};
    const offset = 0;

    const userId = options.userId;
    const type = options?.type;
    const month = options?.month;

    if (userId) {
      where.senderIdentifiant = userId;
      didUpdateFilters = true;
    }

    if (type && type === 'TRANSFERT') {
      where.transactionType = 'TRANSFERT';
    }

    if (type && type === 'PAIEMENT') {
      where.transactionType = 'PAIEMENT';
    }

    if (type && type === 'DEPOT') {
      where.transactionType = 'DEPOT';
    }

    if (month) {
      const startDate = new Date(new Date().getFullYear(), month - 1, 1);
      const endDate = new Date(
        new Date().getFullYear(),
        month,
        0,
        23,
        59,
        59,
        999,
      );
      where.createdAt = Between(startDate, endDate);
      didUpdateFilters = true;
    }

    if (didUpdateFilters) {
      const response = await this.repository.findAndCount({
        where,
        skip: offset,
        order: {
          createdAt: 'DESC',
        },
      });

      const historiques = response[0];
      const count = response[1];

      const data = {
        historiques,
        count,
      };

      return data;
    }
  }

  async getOneHistorique(id: string) {
    const historique = await this.repository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });
    const transactionType = historique.transactionType;
    if (transactionType === 'TRANSFERT') {
      const getTransfertDetails =
        await this.transferService.getTransferByReference(
          historique.referenceTransaction,
        );
      const receiver = await this.userService.getUserById(
        historique.receiverIdentifiant,
      );
      const sender = await this.userService.getUserById(
        historique.senderIdentifiant,
      );
      return {
        ...getTransfertDetails,
        receiver,
        sender,
        transactionType,
      };
    } else if (transactionType === 'PAIEMENT') {
      const getPaiementDetails =
        await this.paiementService.getPaymentByReference(
          historique.referenceTransaction,
        );
      const receiver = await this.userService.getUserById(
        historique.receiverIdentifiant,
      );
      const sender = await this.userService.getUserById(
        historique.senderIdentifiant,
      );
      return {
        ...getPaiementDetails,
        receiver,
        sender,
        transactionType,
      };
    }
  }

  async getTotalSpentForThisMonth(id: number, month: number): Promise<any> {
    const where: FindConditions<Historique> = {};
    const wheres: FindConditions<Historique> = {};
    const offset = 0;
    const startDate = new Date(new Date().getFullYear(), month - 1, 1);
    const endDate = new Date(
      new Date().getFullYear(),
      month,
      0,
      23,
      59,
      59,
      999,
    );

    where.senderIdentifiant = id;
    where.transactionType = 'TRANSFERT';
    where.createdAt = Between(startDate, endDate);

    wheres.senderIdentifiant = id;
    wheres.transactionType = 'PAIEMENT';
    wheres.createdAt = Between(startDate, endDate);

    const response = await this.repository.findAndCount({
      where,
      skip: offset,
    });

    const response2 = await this.repository.findAndCount({
      where: wheres,
      skip: offset,
    });

    const historiques = response[0].concat(response2[0]);
    const totalAmount = historiques.reduce(
      (sum, historique) => sum + parseInt(historique.amount),
      0,
    );

    return totalAmount;
  }

  async getTotalReceivedForThisMonth(id: number, month: number): Promise<any> {
    const where: FindConditions<Historique> = {};
    const offset = 0;
    const startDate = new Date(new Date().getFullYear(), month - 1, 1);
    const endDate = new Date(
      new Date().getFullYear(),
      month,
      0,
      23,
      59,
      59,
      999,
    );

    where.senderIdentifiant = id;
    where.transactionType = 'DEPOT';
    where.createdAt = Between(startDate, endDate);

    const response = await this.repository.findAndCount({
      where,
      skip: offset,
    });

    const historiques = response[0];
    const totalAmount = historiques.reduce(
      (sum, historique) => sum + parseInt(historique.amount),
      0,
    );

    return totalAmount;
  }

  async updateHistorique(id: string, historique: UpdateHistoriqueDto) {
    return await this.repository.update(id, historique);
  }

  async getHistoriqueByReference(reference: string): Promise<Historique> {
    return await this.repository.findOne({
      where: { referenceTransaction: reference },
    });
  }
}
