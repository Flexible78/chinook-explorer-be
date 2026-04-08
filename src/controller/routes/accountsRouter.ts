import express, { type Request, type Response } from "express";
import ServiceError from "../../errors/ServiceError.js";
import { PermissionError } from "../../errors/authErrors.js";
import logger from "../../logger.js";
import { auth } from "../../middleware/auth.js";
import type { Account } from "../../models/Account.js";
import { isUserRole } from "../../models/Account.js";
import type { LoginData } from "../../models/LoginData.js";
import accountingService from "../../services/AccountingServiceImpl.js";

const accountsRouter = express.Router();

type LoginPayload = Partial<LoginData> & { email?: string };
type CreateAccountPayload = Partial<Account> & { email?: string };

function getUsername(payload: { username?: string; email?: string }): string {
    return payload.username ?? payload.email ?? "";
}

accountsRouter.post("/login", async (req: Request<{}, {}, LoginPayload>, res: Response) => {
    try {
        const username = getUsername(req.body);
        const password = req.body.password ?? "";

        if (!username || !password) {
            throw new ServiceError(400, "username and password are required");
        }

        const user = await accountingService.getToken(username, password);
        res.json(user);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }

        logger.error(error, "Error logging in");
        res.status(500).json({ error: "Internal server error" });
    }
});

accountsRouter.post(
    "/",
    auth(accountingService.accountAdminRole),
    async (req: Request<{}, {}, CreateAccountPayload>, res: Response) => {
        try {
            const username = getUsername(req.body);
            const password = req.body.password ?? "";
            const role = req.body.role;

            if (!username || !password || !role) {
                throw new ServiceError(400, "username, password and role are required");
            }

            if (!isUserRole(role)) {
                throw new ServiceError(400, "invalid role");
            }

            await accountingService.addAccount(username, password, role, req.body.name);
            res.status(204).end();
        } catch (error) {
            if (error instanceof ServiceError) {
                res.status(error.code).json({ error: error.message });
                return;
            }

            logger.error(error, "Error creating account");
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

accountsRouter.patch("/", auth(), async (req: Request<{}, {}, LoginPayload>, res: Response) => {
    try {
        const username = getUsername(req.body);
        const password = req.body.password ?? "";

        if (!username || !password) {
            throw new ServiceError(400, "username and password are required");
        }

        if (req.username !== username && req.role !== accountingService.accountAdminRole) {
            throw new PermissionError();
        }

        await accountingService.updatePassword(username, password);
        res.status(204).end();
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }

        logger.error(error, "Error updating password");
        res.status(500).json({ error: "Internal server error" });
    }
});

accountsRouter.delete(
    "/:username",
    auth(accountingService.accountAdminRole),
    async (req: Request<{ username: string }>, res: Response) => {
        try {
            await accountingService.deleteAccount(req.params.username);
            res.status(204).end();
        } catch (error) {
            if (error instanceof ServiceError) {
                res.status(error.code).json({ error: error.message });
                return;
            }

            logger.error(error, "Error deleting account");
            res.status(500).json({ error: "Internal server error" });
        }
    },
);

export default accountsRouter;
