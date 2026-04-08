import ServiceError from "./ServiceError.js";

export class JwtError extends ServiceError {
    constructor(message: string) {
        super(401, message);
    }
}

export class AuthenticationError extends ServiceError {
    constructor() {
        super(401, "Authentication Error");
    }
}

export class PermissionError extends ServiceError {
    constructor() {
        super(403, "Permission Error");
    }
}
