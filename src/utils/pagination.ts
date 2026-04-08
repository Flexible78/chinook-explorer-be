import type { ParsedQs } from "qs";
import type { Response } from "express";
import type { PaginationDto } from "../dto/api.js";
import ServiceError from "../errors/ServiceError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type Pagination = {
    page: number;
    limit: number;
    offset: number;
};

function parsePositiveInteger(value: string, fieldName: string): number {
    const parsedValue = Number.parseInt(value, 10);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new ServiceError(400, `${fieldName} must be a positive integer`);
    }
    return parsedValue;
}

export function getPagination(query: ParsedQs): Pagination | null {
    const rawPage = typeof query.page === "string" ? query.page : undefined;
    const rawLimit = typeof query.limit === "string" ? query.limit : undefined;

    if (!rawPage && !rawLimit) {
        return null;
    }

    const page = rawPage ? parsePositiveInteger(rawPage, "page") : DEFAULT_PAGE;
    const limit = rawLimit ? parsePositiveInteger(rawLimit, "limit") : DEFAULT_LIMIT;

    if (limit > MAX_LIMIT) {
        throw new ServiceError(400, `limit must not exceed ${MAX_LIMIT}`);
    }

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
}

export function setPaginationHeaders(
    res: Response,
    totalCount: number,
    pagination: Pagination,
) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pagination.limit));

    res.setHeader("X-Total-Count", totalCount.toString());
    res.setHeader("X-Page", pagination.page.toString());
    res.setHeader("X-Limit", pagination.limit.toString());
    res.setHeader("X-Total-Pages", totalPages.toString());
}

export function buildPaginationDto(
    totalCount: number,
    itemCount: number,
    pagination: Pagination | null,
): PaginationDto {
    const page = pagination?.page ?? DEFAULT_PAGE;
    const limit = pagination?.limit ?? Math.max(itemCount, 1);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
        page,
        limit,
        totalCount,
        totalPages,
    };
}

export function parseCount(value: unknown): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}
