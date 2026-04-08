export type CustomerDto = {
    id: number;
    firstName: string;
    lastName: string;
    city: string | null;
    country: string | null;
    email: string | null;
};

export type SalesAgentDto = {
    firstName: string;
    lastName: string;
    birthDate: string | null;
    hireDate: string | null;
    city: string | null;
    country: string | null;
    email: string | null;
};

export type InvoiceDto = {
    id: number;
    invoiceDate: string;
    total: number;
};

export type TrackDto = {
    name: string;
    genreName: string | null;
    mediaTypeName: string | null;
};

export type AlbumDto = {
    id: number;
    name: string;
    artistName: string;
};

export type PlaylistDto = {
    id: number;
    name: string;
};

export function toInvoiceDto(invoice: {
    id: number;
    invoiceDate: string;
    total: number | string;
}): InvoiceDto {
    return {
        id: invoice.id,
        invoiceDate: invoice.invoiceDate,
        total: Number(invoice.total),
    };
}
