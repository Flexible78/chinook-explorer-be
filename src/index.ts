import "dotenv/config";
import app from "./controller/app.js";
import logger from "./logger.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});