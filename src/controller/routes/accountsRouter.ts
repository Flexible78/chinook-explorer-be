import express, { type Request, type Response } from "express";
import ServiceError from "../../errors/ServiceError.js";
import { PermissionError } from "../../errors/authErrors.js";
import { auth } from "../../middleware/auth.js";
import type { Account, UserRole } from "../../models/Account.js";
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
    const username = getUsername(req.body);
    const password = req.body.password ?? "";

    if (!username || !password) {
        throw new ServiceError(400, "username and password are required");
    }

    const user = await accountingService.getToken(username, password);
    res.json(user);
});

accountsRouter.post("/", auth(accountingService.accountAdminRole), async (req: Request<{}, {}, CreateAccountPayload>, res: Response) => {
    const username = getUsername(req.body);
    const password = req.body.password ?? "";
    const role = req.body.role;

    if (!username || !password || !role) {
        throw new ServiceError(400, "username, password and role are required");
    }

    if (!isUserRole(role)) {
        throw new ServiceError(400, "invalid role");
    }

    await accountingService.addAccount(username, password, role as UserRole, req.body.name);
    res.status(204).end();
});

accountsRouter.patch("/", auth(), async (req: Request<{}, {}, LoginPayload>, res: Response) => {
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
});

accountsRouter.delete("/:username", auth(accountingService.accountAdminRole), async (req: Request<{ username: string }>, res: Response) => {
    await accountingService.deleteAccount(req.params.username);
    res.status(204).end();
});

export default accountsRouter;
