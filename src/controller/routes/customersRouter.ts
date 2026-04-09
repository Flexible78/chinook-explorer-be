import express, { type Request, type Response } from "express";
import db from "../../db.js";
import ServiceError from "../../errors/ServiceError.js";
import logger from "../../logger.js";
import {
    getPagination,
    parseCount,
    setPaginationHeaders,
} from "../../utils/pagination.js";

const customersRouter = express.Router();

customersRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching customers list...");
        const pagination = getPagination(req.query);
        const customersQuery = db("customer")
            .orderBy("customer_id")
            .select(
                "customer_id as id",
                "first_name as firstName",
                "last_name as lastName",
                "city",
                "country",
                "email",
            );

        if (pagination) {
            const totalResult = await db("customer")
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            customersQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const customers = await customersQuery;
        res.json(customers);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
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
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, "Error fetching agent");
        res.status(500).json({ error: "Internal server error" });
    }
});

customersRouter.get("/:id/invoices", async (req: Request, res: Response) => {
    try {
        logger.info(`[DB] Fetching invoices for customer ${req.params.id}...`);
        const pagination = getPagination(req.query);
        const invoicesQuery = db("invoice")
            .where("customer_id", req.params.id)
            .orderBy("invoice_id")
            .select(
                "invoice_id as invoiceId",
                "invoice_date as invoiceDate",
                "total",
            );

        if (pagination) {
            const totalResult = await db("invoice")
                .where("customer_id", req.params.id)
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            invoicesQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const invoices = await invoicesQuery;
        res.json(invoices);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, "Error fetching invoices");
        res.status(500).json({ error: "Internal server error" });
    }
});

customersRouter.get("/:customerId/invoices/:invoiceId/tracks", async (req: Request, res: Response) => {
    try {
        logger.info(
            `[DB] Fetching invoice tracks for customer ${req.params.customerId}, invoice ${req.params.invoiceId}...`,
        );
        const pagination = getPagination(req.query);

        const tracksQuery = db("invoice_line")
            .join("invoice", "invoice_line.invoice_id", "=", "invoice.invoice_id")
            .join("track", "invoice_line.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("invoice.customer_id", req.params.customerId)
            .andWhere("invoice.invoice_id", req.params.invoiceId)
            .orderBy("invoice_line.invoice_line_id")
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
                "invoice_line.unit_price as unitPrice",
            );

        if (pagination) {
            const totalResult = await db("invoice_line")
                .join("invoice", "invoice_line.invoice_id", "=", "invoice.invoice_id")
                .where("invoice.customer_id", req.params.customerId)
                .andWhere("invoice.invoice_id", req.params.invoiceId)
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            tracksQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const tracks = await tracksQuery;
        res.json(tracks);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, "Error fetching invoice tracks");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default customersRouter;
