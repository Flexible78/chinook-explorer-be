import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const customersRouter = express.Router();

customersRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("DB request: fetching customers...");

        const customers = await db("customer").select("*");

        res.json(customers);
    } catch (error) {
        logger.error(error, "Error fetching customers");
        res.status(500).json({ error: "Internal server error" });
    }
});
// Route: Get sales agent for a specific customer
customersRouter.get("/:id/agent", async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        logger.info(`DB request: fetching agent for customer ${customerId}...`);

        const agent = await db("customer")
            .join("employee", "customer.support_rep_id", "=", "employee.employee_id")
            .where("customer.customer_id", customerId)
            .select(
                "employee.first_name as firstName",
                "employee.last_name as lastName",
                "employee.birth_date as birthDate",
                "employee.hire_date as hireDate",
                "employee.city",
                "employee.country",
                "employee.email"
            )
            .first();

        if (!agent) {
            res.status(404).json({ error: "Agent not found" });
            return;
        }

        res.json(agent);
    } catch (error) {
        logger.error(error, `Error fetching agent for customer ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route: Get all invoices for a specific customer
customersRouter.get("/:id/invoices", async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        logger.info(`DB request: fetching invoices for customer ${customerId}...`);

        const invoices = await db("invoice")
            .where("customer_id", customerId)
            .select("*");

        res.json(invoices);
    } catch (error) {
        logger.error(error, `Error fetching invoices for customer ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default customersRouter;