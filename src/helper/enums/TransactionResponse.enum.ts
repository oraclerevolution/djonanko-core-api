export enum TransactionResponse {
    SUCCESS = 200,
    ERROR = 400,
    INSUFFICIENT_FUNDS = 403,
    MONTHLY_LIMIT_REACHED = 402,
    NOT_FOUND = 404,
    SAME_NUMBER = 409,
}