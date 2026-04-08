import type { UserRole } from "../models/Account.js";
import type { User } from "../models/User.js";

export default interface AccountingService {
    rootUsername: string;
    accountAdminRole: UserRole;
    getToken(username: string, password: string): Promise<User>;
    addAccount(username: string, password: string, role: UserRole, name?: string): Promise<void>;
    deleteAccount(username: string): Promise<void>;
    updatePassword(username: string, newPassword: string): Promise<void>;
    save(): Promise<void>;
}
