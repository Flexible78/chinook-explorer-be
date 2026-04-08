import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { compareSync, hashSync } from "bcrypt";
import logger from "../logger.js";
import type { Account, UserRole } from "../models/Account.js";
import type { User } from "../models/User.js";
import JwtUtil from "../utils/JwtUtil.js";
import type AccountingService from "./AccountingService.js";
import {
    AccountAlreadyExists,
    AccountingError,
    AccountNotFound,
} from "./shared/service-errors.js";

const DEFAULT_ACCOUNTS_FILE_PATH = "accounts-data.json";

const DEFAULT_ACCOUNTS: Array<Omit<Account, "password"> & { passwordText: string }> = [
    {
        username: "admin@tel-ran.com",
        passwordText: process.env.ROOT_PASSWORD ?? "123",
        role: "SUPER_USER",
        name: "Administrator",
    },
    {
        username: "sale@tel-ran.com",
        passwordText: "123",
        role: "SALE",
        name: "Sales Representative",
    },
    {
        username: "user@tel-ran.com",
        passwordText: "123",
        role: "USER",
        name: "Regular User",
    },
    {
        username: "test@test.com",
        passwordText: "123",
        role: "USER",
        name: "Test User",
    },
];

class AccountingServiceMap implements AccountingService {
    private readonly accounts = new Map<string, Account>();
    private readonly filePath: string;
    private readonly salt: number;
    private hasUpdates = false;
    rootUsername: string;
    accountAdminRole: UserRole;

    constructor() {
        this.rootUsername = (process.env.ROOT_USERNAME ?? "admin@tel-ran.com");
        this.accountAdminRole = (process.env.ACCOUNT_ADMIN_ROLE as UserRole | undefined) ?? "SUPER_USER";
        this.filePath = process.env.ACCOUNTS_FILE_PATH ?? DEFAULT_ACCOUNTS_FILE_PATH;
        this.salt = +(process.env.SALT ?? 10);

        logger.debug(
            `AccountingService config: rootUsername=${this.rootUsername}; accountAdminRole=${this.accountAdminRole}; filePath=${this.filePath}; salt=${this.salt}`,
        );

        this.load();
        this.setDefaultAccounts();
    }

    private setDefaultAccounts() {
        for (const account of DEFAULT_ACCOUNTS) {
            const username = account.role === "SUPER_USER" ? this.rootUsername : account.username;
            const seedAccount: Account = {
                username,
                password: hashSync(account.passwordText, this.salt),
                role: account.role,
                ...(account.name ? { name: account.name } : {}),
            };
            this.ensureSeedAccount(seedAccount);
        }
    }

    private ensureSeedAccount(account: Account) {
        if (!this.accounts.has(account.username)) {
            this.accounts.set(account.username, account);
            this.hasUpdates = true;
            logger.debug(`seed account ${account.username} added`);
        }
    }

    private load() {
        if (!existsSync(this.filePath)) {
            logger.debug("accounts file does not exist");
            return;
        }

        const accountsJson = readFileSync(this.filePath, { encoding: "utf8" });
        const accounts = JSON.parse(accountsJson) as Account[];
        accounts.forEach((account) => this.accounts.set(account.username, account));
        logger.debug(`${accounts.length} accounts restored from storage`);
        this.hasUpdates = false;
    }

    async save(): Promise<void> {
        if (!this.hasUpdates) {
            logger.debug("accounts are unchanged and were not saved");
            return;
        }

        const accounts = Array.from(this.accounts.values()).filter(
            (account) => account.username !== this.rootUsername,
        );

        await writeFile(this.filePath, JSON.stringify(accounts, null, 2), {
            encoding: "utf8",
        });

        logger.debug(`${accounts.length} accounts saved`);
        this.hasUpdates = false;
    }

    async getToken(username: string, password: string): Promise<User> {
        const account = this.accounts.get(username);
        if (!account || !compareSync(password, account.password)) {
            logger.warn(`Failed login for: ${username}`);
            throw new AccountingError();
        }

        logger.info(`User logged in: ${account.username} (Role: ${account.role})`);

        return {
            username: account.username,
            role: account.role,
            token: JwtUtil.sign(account),
            userName: account.name ?? account.username,
        };
    }

    async addAccount(
        username: string,
        password: string,
        role: UserRole,
        name?: string,
    ): Promise<void> {
        this.checkUsername(username);
        const account: Account = {
            username,
            role,
            password: hashSync(password, this.salt),
            ...(name ? { name } : {}),
        };
        this.accounts.set(username, account);
        this.hasUpdates = true;
        logger.debug(`account ${username} added`);
    }

    async deleteAccount(username: string): Promise<void> {
        this.checkUsername(username, false);
        this.accounts.delete(username);
        this.hasUpdates = true;
        logger.debug(`account ${username} deleted`);
    }

    async updatePassword(username: string, newPassword: string): Promise<void> {
        this.checkUsername(username, false);
        const account = this.accounts.get(username)!;
        account.password = hashSync(newPassword, this.salt);
        this.hasUpdates = true;
        logger.debug(`account ${username} password updated`);
    }

    private checkUsername(username: string, shouldNotExist = true) {
        if (shouldNotExist && this.accounts.has(username)) {
            throw new AccountAlreadyExists(username);
        }

        if (!shouldNotExist && !this.accounts.has(username)) {
            throw new AccountNotFound(username);
        }
    }
}

const accountingService: AccountingService = new AccountingServiceMap();

export default accountingService;
