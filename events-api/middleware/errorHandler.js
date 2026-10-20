export function errorHandler(error, req, res, next) {
    console.log('5. errorHandler');
    if (res.headersSent) return next(error);

    const status = error.statusCode || error.status || 500;
    const isServerError = status >= 500;
    const code = isServerError ? 'INTERNAL_SERVER_ERROR'
        : error.code || (status === 400 ? 'BAD_REQUEST' : 'REQUEST_ERROR');
    const titles = {
        VALIDATION_ERROR: 'Request validation failed',
        BAD_REQUEST: 'Bad request',
        EVENT_NOT_FOUND: 'Event not found',
        EVENT_ALREADY_EXISTS: 'Event already exists',
        EVENT_LIMIT_REACHED: 'Event limit reached',
        ROUTE_NOT_FOUND: 'Route not found',
        INTERNAL_SERVER_ERROR: 'Internal server error',
    };
    const response = {
        type: `https://example.com/problems/${code.toLowerCase().replaceAll('_', '-')}`,
        title: titles[code] || 'Request failed',
        status,
        detail: isServerError ? 'An unexpected server error occurred'
            : error.type === 'entity.parse.failed' ? 'Request body must contain valid JSON' : error.message,
        instance: req.originalUrl,
        code,
        requestId: req.requestId,
    };
    if (!isServerError && error.validationErrors) response.errors = error.validationErrors;
    if (isServerError) {
        console.error({ requestId: req.requestId, message: error.message, stack: error.stack });
    }
    res.status(status).type('application/problem+json').json(response);
}
