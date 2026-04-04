import express from "express";
import customersRouter from "./routes/customersRouter.js";
import albumsRouter from "./routes/albumsRouter.js";
import playlistsRouter from "./routes/playlistsRouter.js";

const app = express();

app.use(express.json()); // Чтобы сервер понимал JSON-запросы

// Наши главные роуты (по ТЗ)
app.use("/customers", customersRouter);
app.use("/albums", albumsRouter);
app.use("/playlists", playlistsRouter);

export default app;