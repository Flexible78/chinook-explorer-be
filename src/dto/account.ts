import type { UserRole } from "../models/Account.js";

export type AuthDto = {
    username: string;
    role: UserRole;
    token: string;
    name: string;
};
