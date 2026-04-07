import express from "express";
import morgan from "morgan";
import cors from "cors";
import accountsRouter from "./routes/accountsRouter.js";
import customersRouter from "./routes/customersRouter.js";
import albumsRouter from "./routes/albumsRouter.js";
import playlistsRouter from "./routes/playlistsRouter.js";
import invoicesRouter from "./routes/invoicesRouter.js";
import { authorize } from "../middleware/auth.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Public routes
app.use("/accounts", accountsRouter);

// Protected routes
app.use("/customers", authorize(["SALE", "SUPER_USER"]), customersRouter);
app.use("/invoices", authorize(["SALE", "SUPER_USER"]), invoicesRouter);
app.use("/albums", authorize(["USER", "SUPER_USER"]), albumsRouter);
app.use("/playlists", authorize(["USER", "SUPER_USER"]), playlistsRouter);

app.get("/ping", (req, res) => res.send("pong"));

export default app;
