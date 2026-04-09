import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import {
    AuthenticationError,
    JwtError,
    PermissionError,
} from "../errors/authErrors.js";
import logger from "../logger.js";
import JwtUtil from "../utils/JwtUtil.js";

const BEARER = "Bearer ";

export const security_context: RequestHandler = (req, _, next) => {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith(BEARER)) {
        const token = authHeader.slice(BEARER.length);
        const { username, role, auth_error } = parseToken(token);
        req.username = username;
        req.role = role;
        req.auth_error = auth_error;
        logger.debug(`security_context attached ${JSON.stringify({ username, role, auth_error })}`);
    } else {
        req.username = null;
        req.role = null;
        req.auth_error = null;
        logger.debug(`security_context: no token for ${req.method} ${req.originalUrl}`);
    }
    next();
};

function parseToken(token: string): {
    username: string | null;
    role: string | null;
    auth_error: string | null;
} {
    let payload = { sub: null, role: null } as JwtPayload & {
        role: string | null;
        sub: string | null;
    };
    let auth_error: string | null = null;

    try {
        payload = JwtUtil.verify(token) as typeof payload;
    } catch (error) {
        const jwtError = error as Error;
        auth_error = `${jwtError.name}: ${jwtError.message}`;
    }

    return {
        username: payload.sub,
        role: typeof payload.role === "string" ? payload.role : null,
        auth_error,
    };
}

export function auth(...roles: string[]): RequestHandler {
    return (req: Request, _: Response, next: NextFunction) => {
        if (req.auth_error) {
            throw new JwtError(req.auth_error);
        }

        if (!req.username) {
            throw new AuthenticationError();
        }

        if (!req.role || (roles.length !== 0 && !roles.includes(req.role))) {
            throw new PermissionError();
        }

        next();
    };
}