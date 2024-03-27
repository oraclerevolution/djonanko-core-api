import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { HistoriquesService } from 'src/historiques/historiques.service';
import { MakePaiementDto, makePaiementResultDto } from './dto/make-paiement.dto';
import { CreateHistoriqueDto, CreateHistoriqueResultDto } from 'src/historiques/dto/create-historique.dto';
import { TransactionType } from 'src/historiques/enums/transaction-type.enum';
import { TransactionType as PaiementType } from "src/transfert/enums/transfer-type.enum"
import { CompteCollecteService } from 'src/compte-collecte/compte-collecte.service';
import { CollectType } from 'src/compte-collecte/enums/collect-type.enum';
import { Cron } from '@nestjs/schedule';
import { PaymentInitDto } from './dto/payment-init.dto';
import { User } from 'src/user/entities/user.entity';
import { CompteReservationService } from 'src/compte-reservation/compte-reservation.service';
import { TransactionResponse } from 'src/helper/enums/TransactionResponse.enum';
import { CompteReservation } from 'src/compte-reservation/entities/compte-reservation.entity';
import { PaymentDebitDto } from './dto/payment-debit.dto';
import { PaymentExecDto } from './dto/payment-exec.dto';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ValidatePaymentDto } from './dto/validate-payment.dto';
import { MakeAbonnementDto } from './dto/abonnement.dto';
import { Historique } from 'src/historiques/entities/historique.entity';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Transactions } from 'src/transactions/entities/transactions.entity';

@Injectable()
export class PaiementService {
    constructor(
        @InjectRepository(Paiement) private readonly repository: Repository<Paiement>,
        private readonly userService: UserService,
        @Inject(forwardRef(() => HistoriquesService)) private readonly historiqueService: HistoriquesService,
        private readonly compteCollecteService: CompteCollecteService,
        private readonly compteReservationService: CompteReservationService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => TransactionsService)) private readonly transactionService: TransactionsService
    ) { }

    /**
     * Initializes a payment with the given payload.
     *
     * @param {MakePaiementDto} payload - The payload containing information about the payment.
     * @returns {Promise<PaymentInitDto>} - A promise that resolves to the initialized payment.
     */
    async paymentInitializer(payload: MakePaiementDto): Promise<PaymentInitDto> {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = payload;
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber);

        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverPhoneNumber);
        console.log('getReceiverInfos', getReceiverInfos);
        const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);

        if (getReceiverInfos === undefined) {
            return {
                payment: null,
                amount: amount,
                historique: null,
                transaction: null,
                fees: null,
                senderInfos: null,
                status: TransactionResponse.NOT_FOUND,
                receiverNumber: receiverPhoneNumber
            }
        } else {
            //on initialise le paiement avec un statut PENDING
            const payment = new Paiement()
            payment.amount = amount;
            if (getSenderInfos.premium === true) {
                payment.fees = (0.005 * parseInt(amount)).toString();
            } else {
                payment.fees = (0.01 * parseInt(amount)).toString();
            }
            payment.amountBeforeSending = getSenderInfos.solde;
            payment.reference = this.generateReference();
            payment.amountAfterSending = (balanceAfterSending).toString();
            payment.senderPhoneNumber = senderPhoneNumber;
            payment.receiverPhoneNumber = receiverPhoneNumber
            await this.repository.save(payment);
    
            //on cree la transaction
            // const newPayment = await this.createpaiement(payload, getSenderInfos);
            let historique: CreateHistoriqueResultDto = null
            if (payment) {
                const transaction = await this.transactionService.createTransaction({
                    amount: amount,
                    amountBeforeSending: payment.amountBeforeSending,
                    amountAfterSending: payment.amountAfterSending,
                    senderPhoneNumber: payment.senderPhoneNumber,
                    reference: payment.reference,
                    receiverPhoneNumber: payment.receiverPhoneNumber,
                    fees: payment.fees,
                    status: "PENDING",
                    type: TransactionType.PAIEMENT,
                })
                historique = await this.createHistorique({
                    sender: getSenderInfos,
                    receiver: getReceiverInfos,
                    senderIdentifiant: getSenderInfos.id,
                    receiverIdentifiant: getReceiverInfos.id,
                    referenceTransaction: payment.reference,
                    transactionType: TransactionType.PAIEMENT,
                    amount: amount,
                    fees: payment.fees,
                    status: "PENDING",
                    icon: 'send'
                })
                //supprimer les données non utilisable
                delete (historique.historique.sender)
                delete (historique.historique.receiver)
    
                return {
                    payment: payment,
                    amount: amount,
                    historique: historique.historique,
                    transaction: transaction,
                    fees: payment.fees,
                    senderInfos: getSenderInfos,
                    status: TransactionResponse.SUCCESS,
                    receiverNumber: receiverPhoneNumber
                }
    
            } else {
                await this.repository.update(payment.id, {
                    status: "FAILED"
                })
                return {
                    payment: payment,
                    amount: amount,
                    historique: historique.historique,
                    transaction: null,
                    fees: payment.fees,
                    senderInfos: getSenderInfos,
                    status: TransactionResponse.ERROR,
                    receiverNumber: receiverPhoneNumber
                }
            }
        }

    }

    /**
     * Debits the payment from the sender's account and creates a reservation
     * and a collection record.
     *
     * @param {Paiement} paiement - The payment object.
     * @param {string} amount - The amount of the payment.
     * @param {User} senderInfos - Information about the sender.
     * @param {string} fees - The fees associated with the payment.
     * @param {string} receiverNumber - The receiver's phone number.
     * @return {Promise<PaymentDebitDto>} The debit payment DTO.
     */
    async paymentDebit(paiement: Paiement, transaction: Transactions, historique: Historique, amount: string, senderInfos: User, fees: string, receiverNumber: string): Promise<PaymentDebitDto> {
        const cost = parseInt(amount) + parseInt(fees);
        const balanceAfterSending = parseInt(senderInfos.solde) - cost;
        if (balanceAfterSending < 0) {
            await this.repository.update(paiement.id, {
                status: "FAILED"
            })
            await this.transactionService.updateTransaction(transaction.id, {
                status: "FAILED"
            })
            return {
                paiement,
                transaction,
                reservation: null,
                amount,
                receiverNumber,
                senderInfos,
                fees,
                status: TransactionResponse.INSUFFICIENT_FUNDS
            }
        }
        await this.userService.updateUser(senderInfos.id, {
            solde: balanceAfterSending.toString(),
        })

        const reservation = await this.compteReservationService.createCompteReservation({
            amount: amount,
            fees: fees,
            fundsToSend: (parseInt(amount) + parseInt(fees)).toString(),
            transactionStatus: "IN PROGRESS",
            transactionType: TransactionType.PAIEMENT
        })
        if (reservation) {
            const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
            const balanceAfterSending = parseInt(user.solde) + parseInt(amount) + parseInt(fees);
            const credit = await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString(),
            })
            if (credit.affected === 1) {
                return {
                    paiement,
                    transaction,
                    reservation,
                    amount,
                    receiverNumber,
                    senderInfos,
                    fees,
                    status: TransactionResponse.SUCCESS
                }
            } else {
                await this.repository.update(paiement.id, {
                    status: "FAILED"
                })
                await this.historiqueService.updateHistorique(historique.id, {
                    status: "FAILED"
                })
                await this.transactionService.updateTransaction(transaction.id, {
                    status: "FAILED"
                })
                return {
                    paiement,
                    transaction,
                    reservation,
                    amount,
                    receiverNumber,
                    senderInfos,
                    fees,
                    status: TransactionResponse.ERROR
                }
            }
        }
    }

    /**
     * Sends a payment from the sender to the receiver.
     *
     * @param {User} senderInfos - The information of the sender.
     * @param {CompteReservation} reservation - The reservation associated with the payment.
     * @param {string} receiverNumber - The phone number of the receiver.
     * @param {string} amount - The amount of the payment.
     * @param {Paiement} paiement - The payment object.
     * @param {string} fees - The fees associated with the payment.
     * @return {Promise<PaymentExecDto>} - The payment execution response.
     */
    async sendPayment(senderInfos: User, reservation: CompteReservation, receiverNumber: string, amount: string, paiement: Paiement, transaction: Transactions, fees: string, historique: Historique, abonnement?: boolean): Promise<PaymentExecDto> {
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverNumber);
        const updateReceiverBalance = await this.userService.updateUser(getReceiverInfos.id, {
            solde: (parseInt(getReceiverInfos.solde) + parseInt(amount)).toString()
        })
        if (updateReceiverBalance.affected === 1) {
            //debit reservation account
            const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
            const balanceAfterSending = parseInt(user.solde) - (parseInt(amount) + parseInt(fees));
            const debit = await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString(),
            })
            if (debit.affected === 1) {
                const user = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_COLLECTE'))
                const balanceAfterSending = parseInt(user.solde) + parseInt(fees);
                const credit = await this.userService.updateUser(user.id, {
                    solde: balanceAfterSending.toString(),
                })
                if (credit) {
                    await this.compteCollecteService.createCompteCollect({
                        amount: fees,
                        collectType: CollectType.FRAIS
                    })
                    //update reservation status
                    await this.compteReservationService.updateCompteReservation(reservation.id, {
                        transactionStatus: "COMPLETED"
                    })

                    //update payment status
                    await this.repository.update(paiement.id, {
                        status: PaiementType.SUCCESS
                    })

                    //update transaction status
                    await this.transactionService.updateTransaction(transaction.id, {
                        status: "SUCCESS"
                    })

                    //update historique status
                    await this.historiqueService.updateHistorique(historique.id, {
                        status: PaiementType.SUCCESS
                    })

                    if (abonnement && abonnement === true) {
                        await this.userService.updateUser(senderInfos.id, {
                            premium: true,
                            premiumActivated: true
                        })
                    }
                } else {
                    return {
                        status: TransactionResponse.ERROR
                    }
                }

                return {
                    status: TransactionResponse.SUCCESS
                }

            } else {
                await this.repository.update(paiement.id, {
                    status: PaiementType.FAILED
                })
                await this.transactionService.updateTransaction(transaction.id, {
                    status: "FAILED"
                })
                return {
                    status: TransactionResponse.ERROR
                }
            }
        } else {
            await this.repository.update(paiement.id, {
                status: PaiementType.FAILED
            })
            await this.transactionService.updateTransaction(transaction.id, {
                status: "FAILED"
            })
            await this.compteReservationService.updateCompteReservation(reservation.id, {
                transactionStatus: "FAILED"
            })
            await this.historiqueService.updateHistorique(historique.id, {
                status: "FAILED"
            })
            return {
                status: TransactionResponse.ERROR
            }
        }

    }

    /**
     * Perform the abonnement process.
     *
     * @param {MakeAbonnementDto} payload - the payload containing amount, sender phone number, and receiver phone number
     * @return {Object} an object containing the status of the transaction
     */
    async makeAbonnement(payload: MakeAbonnementDto) {
        const { amount, senderPhoneNumber, receiverPhoneNumber } = payload
        const compteCollect = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_COLLECTE'))
        //get sender & receiver information
        const getSenderInfos = await this.userService.getUserByPhoneNumber(senderPhoneNumber);
        const getReceiverInfos = await this.userService.getUserByPhoneNumber(receiverPhoneNumber);
        //initialize payment
        const payment = new Paiement()
        payment.amount = amount
        payment.fees = "0"
        payment.amountBeforeSending = getSenderInfos.solde
        payment.reference = this.generateReference()
        payment.amountAfterSending = (parseInt(getSenderInfos.solde) - parseInt(amount)).toString()
        payment.senderPhoneNumber = senderPhoneNumber
        payment.receiverPhoneNumber = receiverPhoneNumber
        await this.repository.save(payment);

        //initialize historique
        const historique = await this.createHistorique({
            sender: getSenderInfos,
            receiver: getReceiverInfos,
            senderIdentifiant: getSenderInfos.id,
            receiverIdentifiant: getReceiverInfos.id,
            referenceTransaction: payment.reference,
            transactionType: TransactionType.ABONNEMENT,
            amount: amount,
            fees: "0",
            status: PaiementType.PENDING,
            icon: "sync"
        })

        if (historique) {
            if (payment) {
                //initialize transaction
                const transaction = await this.transactionService.createTransaction({
                    amount: amount,
                    amountBeforeSending: getSenderInfos.solde,
                    amountAfterSending: (parseInt(getSenderInfos.solde) - parseInt(amount)).toString(),
                    senderPhoneNumber: senderPhoneNumber,
                    reference: payment.reference,
                    receiverPhoneNumber: receiverPhoneNumber,
                    fees: "0",
                    status: 'PENDING',
                    type: TransactionType.ABONNEMENT
                })
                if (transaction) {
                    //debit sender account
                    const debitSender = await this.userService.updateUser(getSenderInfos.id, {
                        solde: (parseInt(getSenderInfos.solde) - parseInt(amount)).toString()
                    })
                    if (parseInt(getSenderInfos.solde) - parseInt(amount) < 0 || parseInt(getSenderInfos.solde) < parseInt(amount)) {
                        //update payment status
                        await this.repository.update(payment.id, { status: PaiementType.FAILED })
                        //update transaction status
                        await this.transactionService.updateTransaction(transaction.id, { status: PaiementType.FAILED })
                        //update historique status
                        await this.historiqueService.updateHistorique(historique.historique.id, { status: PaiementType.FAILED })
                        throw new HttpException('Fonds insuffisants', HttpStatus.BAD_REQUEST)
                    }
                    if (debitSender.affected === 1) {
                        //create reservation
                        const reservation = await this.compteReservationService.createCompteReservation({
                            amount: amount,
                            fees: "0",
                            fundsToSend: amount,
                            transactionStatus: "IN PROGRESS",
                            transactionType: TransactionType.ABONNEMENT
                        })
                        if (reservation) {
                            const creditCompteReservation = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
                            const credit = await this.userService.updateUser(creditCompteReservation.id, {
                                solde: (parseInt(creditCompteReservation.solde) + parseInt(amount)).toString()
                            })
                            if (credit.affected === 1) {
                                //credit collect account
                                const creditCollectAccount = await this.compteCollecteService.createCompteCollect({
                                    amount: amount,
                                    collectType: CollectType.ABONNEMENT
                                })
                                if (creditCollectAccount) {
                                    //update collect account
                                    await this.userService.updateUser(compteCollect.id, {
                                        solde: (parseInt(compteCollect.solde) + parseInt(amount)).toString()
                                    })
                                    const debitReservation = await this.userService.updateUser(creditCompteReservation.id, {
                                        solde: (parseInt(creditCompteReservation.solde) - parseInt(amount)).toString()
                                    })
                                    if (debitReservation.affected === 1) {
                                        //debit reservation account
                                        await this.compteReservationService.updateCompteReservation(reservation.id, {
                                            transactionStatus: "COMPLETED"
                                        })
                                        //update user info
                                        await this.userService.updateUser(getSenderInfos.id, {
                                            premium: true,
                                            premiumActivated: true
                                        })

                                        //update historique
                                        await this.historiqueService.updateHistorique(historique.historique.id, {
                                            status: "SUCCESS"
                                        })

                                        //update payment
                                        await this.repository.update(payment.id, {
                                            status: "SUCCESS"
                                        })

                                        //update transaction
                                        await this.transactionService.updateTransaction(transaction.id, {
                                            status: "SUCCESS"
                                        })
                                    }
                                    return {
                                        status: TransactionResponse.SUCCESS
                                    }
                                } else {
                                    await this.compteReservationService.updateCompteReservation(reservation.id, {
                                        transactionStatus: "FAILED"
                                    })
                                    // create historique
                                    await this.historiqueService.updateHistorique(historique.historique.id, {
                                        status: "FAILED",
                                    })
                                    return {
                                        status: TransactionResponse.ERROR
                                    }
                                }
                            }
                        }
                    } else {
                        return {
                            status: TransactionResponse.ERROR
                        }
                    }

                }
            }
        }

    }

    /**
     * Calculates the transaction fees for a given amount.
     *
     * @param {number} amount - The amount for which to calculate the transaction fees.
     * @return {number} - The total amount including the transaction fees.
     */
    getTransactionFees(amount: number, mode: boolean): number {
        if (mode === true) {
            const fees = 0.005 * amount;
            return amount + fees;
        } else {
            const fees = 0.01 * amount;
            return amount + fees;
        }
    }

    /**
     * cron job to debit premium subscription every 28th of the month
     */
    @Cron('0 0 0 28 * *')
    /**
     * Debits premium subscription for all premium users.
     *
     * @return {Promise<void>} Promise that resolves when the operation is complete.
     */
    async debitPremium() {
        console.log('Debiting premium subscription...');
        const getPremiumUsers = await this.userService.getUsersPremiums();
        for (const user of getPremiumUsers) {
            const balanceAfterSending = parseInt(user.solde) - 2000;
            await this.userService.updateUser(user.id, {
                solde: balanceAfterSending.toString(),
                premiumActivated: true
            })
            await this.historiqueService.createHistorique({
                sender: user,
                receiver: user,
                senderIdentifiant: user.id,
                receiverIdentifiant: user.id,
                transactionType: TransactionType.ABONNEMENT,
                referenceTransaction: "ABONNEMENT",
                amount: "2000",
                fees: "0",
                status: "SUCCESS",
                icon: 'sync'
            })
            await this.compteCollecteService.createCompteCollect({
                amount: "2000",
                collectType: CollectType.ABONNEMENT
            })
        }
    }


    @Cron('0 0 0 27 * *')
    /**
     * Changes the premium status of users.
     *
     * @return {Promise<void>} Returns a promise that resolves when the premium status of all users has been updated.
     */
    async changePremiumStatus() {
        console.log('Changing premium status...');
        const getPremiumUsers = await this.userService.changePremiumStatus();
        for (const user of getPremiumUsers) {
            await this.userService.updateUser(user.id, {
                premiumActivated: false
            })
        }
    }

    /**
     * Generates a random reference string.
     *
     * @return {string} The generated reference string.
    */
    generateReference(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let reference = '';
        for (let i = 0; i < 10; i++) {
            reference += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `DJONANKO-${reference}`;
    }

    async getPaymentByReference(reference: string): Promise<Paiement> {
        return await this.repository.findOne({
            where: {
                reference
            }
        })
    }

    async paymentRequest(payload: PaymentRequestDto): Promise<Paiement> {
        const { amount, senderPhoneNumber, receiverPhoneNumber } = payload
        const debitedUser = await this.userService.getUserByPhoneNumber(senderPhoneNumber)
        const creditedUser = await this.userService.getUserByPhoneNumber(receiverPhoneNumber)
        const paymentRequest = this.repository.create({
            amount,
            amountBeforeSending: debitedUser.solde,
            amountAfterSending: (parseInt(debitedUser.solde) - parseInt(amount)).toString(),
            senderPhoneNumber: senderPhoneNumber,
            fees: "0",
            reference: this.generateReference(),
            receiverPhoneNumber: receiverPhoneNumber,
            status: PaiementType.PAYMENT_REQUEST_PENDING
        })

        const result = await this.repository.save(paymentRequest)

        if (result) {
            //create a transaction
            await this.transactionService.createTransaction({
                amount: amount,
                amountBeforeSending: creditedUser.solde,
                amountAfterSending: (parseInt(creditedUser.solde) + parseInt(amount)).toString(),
                senderPhoneNumber: senderPhoneNumber,
                reference: result.reference,
                receiverPhoneNumber: receiverPhoneNumber,
                fees: "0",
                type: TransactionType.PAYMENT_REQUEST
            })
            //if payment request is successful we create an history
            await this.historiqueService.createHistorique({
                sender: debitedUser,
                receiver: creditedUser,
                senderIdentifiant: debitedUser.id,
                receiverIdentifiant: creditedUser.id,
                referenceTransaction: result.reference,
                transactionType: TransactionType.PAYMENT_REQUEST,
                amount: amount,
                fees: "0",
                status: "PENDING",
                icon: 'send'
            })
        } else {
            throw new BadRequestException('Le paiement a échoué')
        }

        return result
    }

    async validatePaymentRequest(payload: ValidatePaymentDto, authUser: User): Promise<PaymentExecDto> {
        const { reference } = payload
        const transaction = await this.transactionService.getTransactionByReference(reference)
        if (authUser.numero !== transaction.senderPhoneNumber) {
            throw new BadRequestException('Vous ne pouvez pas valider ce paiement')
        }
        try {
            const paymentRequest = await this.repository.findOne({
                where: {
                    reference
                }
            })
            const paymentRequestHistory = await this.historiqueService.getHistoriqueByReference(reference)
            const debitedUser = await this.userService.getUserByPhoneNumber(paymentRequest.senderPhoneNumber)
            const creditedUser = await this.userService.getUserByPhoneNumber(paymentRequest.receiverPhoneNumber)
            //on débite la somme du paiement au client
            const cost = (parseInt(paymentRequest.amount) + parseInt(paymentRequest.fees)).toString()
            const balanceAfterSending = parseInt(debitedUser.solde) - parseInt(cost);
            await this.userService.updateUser(debitedUser.id, {
                solde: balanceAfterSending.toString()
            })
            //apres avoir debiter la somme on credite le compte de reservation
            const reservation = await this.compteReservationService.createCompteReservation({
                amount: paymentRequest.amount,
                fundsToSend: cost,
                fees: "0",
                transactionStatus: "IN PROGRESS",
                transactionType: TransactionType.PAYMENT_REQUEST
            })
            if (reservation) {
                const compteReservation = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_RESERVATION'))
                if (compteReservation) {
                    await this.userService.updateUser(compteReservation.id, {
                        solde: (parseInt(compteReservation.solde) + parseInt(cost)).toString(),
                    })
                }
            }
            //on credite le compte du beneficiaire
            const updateReceiverBalance = await this.userService.updateUser(creditedUser.id, {
                solde: (parseInt(creditedUser.solde) + parseInt(paymentRequest.amount)).toString(),
            })
            if (updateReceiverBalance.affected === 1) {
                //on debite le compte de reservation
                const updateReservationBalance = await this.compteReservationService.updateCompteReservation(reservation.id, {
                    amount: (parseInt(reservation.amount) - parseInt(cost)).toString(),
                })
                if (updateReservationBalance.affected === 1) {
                    const updateReservation = await this.compteReservationService.updateCompteReservation(reservation.id, {
                        transactionStatus: "COMPLETED",
                    })

                    if (updateReservation.affected === 1) {
                        //on update le statut de paiement de la requête de paiement
                        await this.repository.update(paymentRequest.id, {
                            status: PaiementType.PAYMENT_REQUEST_SUCCESS
                        })
                        //on update le statut de la transaction
                        await this.transactionService.updateTransaction(transaction.id, {
                            status: "SUCCESS",
                        })
                        //on update le statut de la requête de paiement dans l'historique
                        await this.historiqueService.updateHistorique(paymentRequestHistory.id, {
                            status: "SUCCESS"
                        })
                        //on credite le compte de collecte
                        const compteCollecte = await this.userService.getUserByPhoneNumber(this.configService.get<string>('COMPTE_COLLECTE'))
                        if (compteCollecte) {
                            await this.userService.updateUser(compteCollecte.id, {
                                solde: (parseInt(compteCollecte.solde) + parseInt(paymentRequest.fees)).toString(),
                            })
                        }
                    }
                }
            }

            return {
                status: TransactionResponse.SUCCESS
            }
        } catch (error) {
            console.log("An error occurred:", error);
            return {
                status: TransactionResponse.ERROR
            }
        }
    }

    async getAllPendingPaymentForAMerchant(receiverPhoneNumber: string): Promise<Paiement[]> {
        return await this.repository.find({
            where: {
                receiverPhoneNumber,
                status: PaiementType.PAYMENT_REQUEST_PENDING
            }
        })
    }

    async getPaiementByReceiverNumber(receiverPhoneNumber: string): Promise<Paiement[]> {
        return await this.repository.find({
            where: {
                receiverPhoneNumber,
            }
        })
    }


    /**
     * Create a payment with the given payment details and sender information.
     *
     * @param {MakePaiementDto} paiement - the payment details
     * @param {User} getSenderInfos - the sender information
     * @return {Promise<any>} an object containing the payment and status
     */
    async createpaiement(paiement: MakePaiementDto, getSenderInfos: User): Promise<makePaiementResultDto> {
        const { senderPhoneNumber, receiverPhoneNumber, amount } = paiement;
        const balanceAfterSending = parseInt(getSenderInfos.solde) - this.getTransactionFees(parseInt(amount), getSenderInfos.premium);
        const payment = new Paiement()
        payment.amount = amount;
        if (getSenderInfos.premium === true) {
            payment.fees = (0.005 * parseInt(amount)).toString();
        } else {
            payment.fees = (0.01 * parseInt(amount)).toString();
        }
        payment.amountBeforeSending = getSenderInfos.solde;
        payment.reference = this.generateReference();
        payment.amountAfterSending = (balanceAfterSending).toString();
        payment.senderPhoneNumber = senderPhoneNumber;
        payment.receiverPhoneNumber = receiverPhoneNumber;
        await this.repository.save(paiement);

        if (payment) {
            return {
                paiement: payment,
                status: TransactionResponse.SUCCESS
            }
        } else {
            return {
                paiement: payment,
                status: TransactionResponse.ERROR
            }
        }
    }

    async createHistorique(historique: CreateHistoriqueDto): Promise<CreateHistoriqueResultDto> {
        const history = await this.historiqueService.createHistorique(historique)
        if (history) {
            return {
                historique: history,
                status: TransactionResponse.SUCCESS
            }
        } else {
            return {
                historique: history,
                status: TransactionResponse.ERROR
            }
        }
    }
}
