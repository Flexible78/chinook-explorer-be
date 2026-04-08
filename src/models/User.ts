import type { UserRole } from "./Account.js";

export type User = {
    username: string;
    role: UserRole;
    token: string;
    userName?: string;
};
