import knex from "knex";
import "dotenv/config";

// Создаем подключение, используя нашу победную строку и SSL-пропуск
const db = knex({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
});

export default db;