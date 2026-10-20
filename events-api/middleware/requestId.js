import { randomUUID } from 'node:crypto';

export function requestId(req, res, next) {
    console.log('1. requestId');
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    next();
}
