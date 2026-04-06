export const getJwtSecret = (): string => process.env.JWT_SECRET ?? "pass21";
