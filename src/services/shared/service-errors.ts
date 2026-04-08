import ServiceError from "../../errors/ServiceError.js";

export class AccountingError extends ServiceError {
    constructor() {
        super(400, "Incorrect user credentials");
    }
}

export class AccountAlreadyExists extends ServiceError {
    constructor(username: string) {
        super(409, `account ${username} already exists`);
    }
}

export class AccountNotFound extends ServiceError {
    constructor(username: string) {
        super(404, `account ${username} not found`);
    }
}
