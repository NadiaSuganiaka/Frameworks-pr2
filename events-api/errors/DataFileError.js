export class DataFileError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'DataFileError';
        this.originalError = originalError;
    }
}