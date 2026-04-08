import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const customersRouter = express.Router();

customersRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching customers list...");
        const customers = await db("customer").select(
            "customer_id as id",
            "first_name as firstName",
            "last_name as lastName",
            "city",
            "country",
            "email",
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
                "employee.first_name as firstName",
                "employee.last_name as lastName",
                "employee.birth_date as birthDate",
                "employee.hire_date as hireDate",
                "employee.city",
                "employee.country",
                "employee.email",
            )
            .first();

        if (!agent) {
            res.status(404).json({ error: "Sales agent not found" });
            return;
        }

        res.json(agent);
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
            .select(
                "invoice_id as invoiceId",
                "invoice_date as invoiceDate",
                "total",
            );
        res.json(invoices);
    } catch (error) {
        logger.error(error, "Error fetching invoices");
        res.status(500).json({ error: "Internal server error" });
    }
});

customersRouter.get("/:customerId/invoices/:invoiceId/tracks", async (req: Request, res: Response) => {
    try {
        logger.info(
            `[DB] Fetching invoice tracks for customer ${req.params.customerId}, invoice ${req.params.invoiceId}...`,
        );

        const tracks = await db("invoice_line")
            .join("invoice", "invoice_line.invoice_id", "=", "invoice.invoice_id")
            .join("track", "invoice_line.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("invoice.customer_id", req.params.customerId)
            .andWhere("invoice.invoice_id", req.params.invoiceId)
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
            );

        res.json(tracks);
    } catch (error) {
        logger.error(error, "Error fetching invoice tracks");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default customersRouter;
