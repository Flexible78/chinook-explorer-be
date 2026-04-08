import express from "express";
import morgan from "morgan";
import cors from "cors";
import accountsRouter from "./routes/accountsRouter.js";
import customersRouter from "./routes/customersRouter.js";
import albumsRouter from "./routes/albumsRouter.js";
import playlistsRouter from "./routes/playlistsRouter.js";
import errorsHandler from "../middleware/errorsHandling.js";
import { auth, security_context } from "../middleware/auth.js";
import accountingService from "../services/AccountingServiceImpl.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Limit", "X-Total-Pages"],
}));
app.use(security_context);

// Public routes
app.use("/accounts", accountsRouter);

// Protected routes
app.use("/customers", auth("SALE", accountingService.accountAdminRole), customersRouter);
app.use("/albums", auth("USER", accountingService.accountAdminRole), albumsRouter);
app.use("/playlists", auth("USER", accountingService.accountAdminRole), playlistsRouter);

app.get("/ping", (req, res) => res.send("pong"));
app.use(errorsHandler);

export default app;
