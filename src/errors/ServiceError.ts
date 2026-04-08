export default class ServiceError extends Error {
    constructor(
        public code: number,
        message: string,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}
