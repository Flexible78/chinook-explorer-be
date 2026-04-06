import express from "express";
import morgan from "morgan";
import cors from "cors";
import accountsRouter from "./routes/accountsRouter.js";
import customersRouter from "./routes/customersRouter.js";
import albumsRouter from "./routes/albumsRouter.js";
import playlistsRouter from "./routes/playlistsRouter.js";
// 1. Импортируем нашего охранника
import { authorize } from "../middleware/auth.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors())
// Логин доступен всем без токена (иначе как его получить?)
app.use("/accounts", accountsRouter);

// 2. Ставим охранников по ТЗ
app.use("/customers", authorize(["SALE"]), customersRouter);
app.use("/albums", authorize(["USER"]), albumsRouter);
app.use("/playlists", authorize(["USER"]), playlistsRouter);

export default app;