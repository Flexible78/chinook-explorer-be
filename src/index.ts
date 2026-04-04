import "dotenv/config"
import logger from "./logger.js"
import app from "./controller/app.js"
import employeesService from "./service/EmployeesServiceImpl.js"
import seed_dev from "./development/seed_dev.js"
import accountingService from "./service/AccountingServiceImpl.js"
const port = process.env.PORT || 3000
const server = app.listen(port, () => console.log(`server is listening on port ${port}`))
function shutdown() {
    logger.debug("shutdown has called")
    server.close(async() => {
        await employeesService.save();
        await accountingService.save()
        logger.info("server closed; data saved if updated")
    })
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
if (process.env.NODE_ENV != "production") {
    seed_dev(100).then(()=>logger.debug("dev seed finished"))
}
