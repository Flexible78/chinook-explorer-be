import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Account } from "../models/Account.js";
import { getJwtSecret } from "../config.js";

export default class JwtUtil {
    static sign(account: Account): string {
        return jwt.sign({ role: account.role }, getJwtSecret(), {
            subject: account.username,
            expiresIn: +(process.env.JWT_EXPIRES_IN ?? 3600),
        });
    }

    static verify(token: string): JwtPayload {
        return jwt.verify(token, getJwtSecret()) as JwtPayload;
    }
}
