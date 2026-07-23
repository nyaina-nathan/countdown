export class AppError extends Error {
    timestamp : string;
    title : string;
    status : number;
    origin : string;
    constructor(
        message : string,
        title : string,
        status : number,
        origin : string,
    ) {
        super(message);
        this.timestamp = new Date().toISOString();
        this.title = title;
        this.status = status;
        this.origin = origin;
        Object.setPrototypeOf(this, AppError.prototype)
    }
}