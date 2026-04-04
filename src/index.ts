import "dotenv/config";
import app from "./controller/app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Сервер Chinook Explorer запущен на порту ${port}`);
});