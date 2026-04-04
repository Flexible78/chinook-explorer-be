import express from "express";
import customersRouter from "./routes/customersRouter.js";
// import accountsRouter from "./routes/accountsRouter.js"; // Вернем, когда перенесем логику авторизации

const app = express();

app.use(express.json()); // Чтобы сервер понимал JSON-запросы

// Наши главные роуты (по ТЗ)
app.use("/customers", customersRouter);
// app.use("/albums", albumsRouter); // Добавим прямо сейчас
// app.use("/playlists", playlistsRouter); // Добавим прямо сейчас

export default app;