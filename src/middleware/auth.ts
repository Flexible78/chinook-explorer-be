import express, { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config.js";
import logger from "../logger.js";

const SECRET_KEY = getJwtSecret();

// Расширяем стандартный Request, чтобы TypeScript разрешил нам сохранить туда данные юзера
export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

// Наша функция-охранник
export const authorize = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                logger.warn("Access denied: No token provided");
                res.status(401).json({ error: "Unauthorized: No token provided" });
                return;
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
                logger.warn("Access denied: Malformed authorization header");
                res.status(401).json({ error: "Unauthorized: Invalid token format" });
                return;
            }

            const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
            req.user = decoded;

            const userRole = decoded.role;

            if (typeof userRole === "string" && (userRole === "SUPER_USER" || allowedRoles.includes(userRole))) {
                next();
            } else {
                logger.warn(`Access denied: Role ${userRole} is not allowed`);
                res.status(403).json({ error: "Forbidden: Access denied for your role" });
            }
        } catch (error) {
            logger.error(error, "Invalid token");
            res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
    };
};
