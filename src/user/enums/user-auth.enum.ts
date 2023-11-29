import { User } from "../entities/user.entity";

export interface UserAuth {
    access_token: string,
    user: Partial<User>,
    otp: number
}