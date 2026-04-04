import express, {Request, Response} from "express"
import { LoginData } from "../../models/LoginData.js";
import { auth } from "../../middleware/auth.js";
import accountingService from "../../service/AccountingServiceImpl.js";
import { validation_create_account, validation_update_password, validation_login } 
from "../../middleware/validation-middleware.js";
import { Account } from "../../models/Account.js";
import { PermissionError } from "../../errors/authErrors.js";
const accountsRouter = express.Router()
accountsRouter.post("/login", validation_login,
     async (req: Request<{}, {}, LoginData>, res: Response) => {
    const {username, password} = req.body;
    const user = await accountingService.getToken(username, password)
    res.json(user)
})
accountsRouter.post("/", auth(accountingService.accountAdminRole), validation_create_account,
 async (req: Request<{}, {}, Account>, res: Response) => {
    res.statusCode = 204
    const {username, password, role} = req.body
    await accountingService.addAccount(username, password, role);
    res.end()
})
accountsRouter.patch("/",auth(),validation_update_password, async (req: Request<{}, {}, LoginData>, res: Response) => {
    if(req.username != req.body.username && req.role != accountingService.accountAdminRole) {
        throw new PermissionError()
    }
    res.statusCode = 204;
    const {username, password} = req.body
    await accountingService.updatePassword(username, password)
    res.end()
} )
accountsRouter.delete("/:username", auth(accountingService.accountAdminRole), async (req: Request<{username: string}>, res: Response) => {
    res.statusCode = 204
    await accountingService.deleteAccount(req.params.username)
    res.end()
})
export default accountsRouter