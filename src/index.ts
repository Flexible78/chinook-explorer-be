import "dotenv/config";
import app from "./controller/app.js";
import logger from "./logger.js";
import accountingService from "./services/AccountingServiceImpl.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});

function shutdown() {
    logger.debug("shutdown has been called");
    server.close(async () => {
        await accountingService.save();
        logger.info("Server closed; accounts saved if updated");
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
