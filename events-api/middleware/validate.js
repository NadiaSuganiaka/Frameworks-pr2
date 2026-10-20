export function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const error = new Error('One or more request fields are invalid');
            error.statusCode = 400;
            error.code = 'VALIDATION_ERROR';
            error.validationErrors = result.error.issues.map(issue => ({
                field: issue.path.join('.') || source,
                message: issue.message,
            }));
            return next(error);
        }
        req[source] = result.data;
        next();
    };
}
