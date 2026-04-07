import knex from "knex";
import "dotenv/config";

// Create the database connection using the configured connection string and SSL override
const db = knex({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
});

export default db;
