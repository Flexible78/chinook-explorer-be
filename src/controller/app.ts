import express from "express";
import morgan from "morgan"; // <-- 1. Импортируем morgan
import accountsRouter from "./routes/accountsRouter.js";
import customersRouter from "./routes/customersRouter.js";
import albumsRouter from "./routes/albumsRouter.js";
import playlistsRouter from "./routes/playlistsRouter.js";

const app = express();

// <-- 2. Включаем Morgan ПЕРЕД всеми роутерами
// Формат "dev" отлично подходит для разработки: он подсвечивает статусы разными цветами
app.use(morgan("dev"));

app.use(express.json());

app.use("/accounts", accountsRouter);
app.use("/customers", customersRouter);
app.use("/albums", albumsRouter);
app.use("/playlists", playlistsRouter);

export default app;