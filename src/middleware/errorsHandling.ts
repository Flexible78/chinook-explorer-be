import type { NextFunction, Request, Response } from "express";
import ServiceError from "../errors/ServiceError.js";
import logger from "../logger.js";

type ErrorWithStatus = Error & { status?: number };

export default function errorsHandler(
    error: ErrorWithStatus,
    _: Request,
    res: Response,
    __: NextFunction,
) {
    if (error instanceof ServiceError) {
        res.status(error.code);
    } else if (typeof error.status === "number") {
        res.status(error.status);
    } else {
        res.status(500);
    }

    logger.error(error, error.message);
    res.json({ error: error.message });
}
