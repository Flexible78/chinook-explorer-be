import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const customersRouter = express.Router();

customersRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching customers list...");
        const customers = await db("customer").select(
            "customer_id as id", "first_name as firstName", "last_name as lastName",
            "city", "country", "email"
        );
        res.json(customers);
    } catch (error) {
        logger.error(error, "Error fetching customers");
        res.status(500).json({ error: "Internal server error" });
    }
});

customersRouter.get("/:id/agent", async (req: Request, res: Response) => {
    try {
        logger.info(`[DB] Fetching agent for customer ${req.params.id}...`);
        const agent = await db("customer")
            .join("employee", "customer.support_rep_id", "=", "employee.employee_id")
            .where("customer.customer_id", req.params.id)
            .select(
                "employee.first_name as firstName", "employee.last_name as lastName",
                "employee.birth_date as birthDate", "employee.hire_date as hireDate",
                "employee.city", "employee.country", "employee.email"
            ).first();
        res.json(agent || { error: "Not found" });
    } catch (error) {
        logger.error(error, "Error fetching agent");
        res.status(500).json({ error: "Internal server error" });
    }
});

customersRouter.get("/:id/invoices", async (req: Request, res: Response) => {
    try {
        logger.info(`[DB] Fetching invoices for customer ${req.params.id}...`);
        const invoices = await db("invoice")
            .where("customer_id", req.params.id)
            .select("invoice_id as invoiceId", "invoice_date as invoiceDate", "total");
        res.json(invoices);
    } catch (error) {
        logger.error(error, "Error fetching invoices");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default customersRouter;