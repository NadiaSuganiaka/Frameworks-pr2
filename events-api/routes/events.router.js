import { Router } from 'express';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema, eventIdSchema, eventsQuerySchema } from '../schemas/event.schemas.js';

const router = Router();
const events = [{ id: 1, title: 'JavaScript Meetup', date: '2026-10-10', isOnline: false }];
let nextId = 2;

function httpError(statusCode, code, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}

function findEvent(req, res, next) {
    req.event = events.find(event => event.id === req.params.id);
    if (!req.event) {
        return next(httpError(404, 'EVENT_NOT_FOUND', `Event with id ${req.params.id} was not found`));
    }
    next();
}

function isDuplicate(candidate, excludedId) {
    return events.some(event => event.id !== excludedId
        && event.title.toLowerCase() === candidate.title.toLowerCase()
        && event.date === candidate.date);
}

function duplicateError() {
    return httpError(409, 'EVENT_ALREADY_EXISTS', 'Event with the same title and date already exists');
}

router.use((req, res, next) => {
    console.log('3. router');
    next();
});

router.get('/error/test', (req, res, next) => next(new Error('Test error')));

router.get('/', validate(eventsQuerySchema, 'query'), (req, res) => {
    const title = req.query.title?.toLowerCase();
    res.json(title ? events.filter(event => event.title.toLowerCase().includes(title)) : events);
});

router.get('/:id', validate(eventIdSchema, 'params'), findEvent, (req, res) => {
    res.json(req.event);
});

router.post('/', validate(createEventSchema), (req, res, next) => {
    if (isDuplicate(req.body)) return next(duplicateError());
    if (events.length >= env.MAX_EVENTS) {
        return next(httpError(409, 'EVENT_LIMIT_REACHED', 'Maximum number of events has been reached'));
    }
    const event = { id: nextId++, ...req.body };
    events.push(event);
    res.status(201).location(`/api/events/${event.id}`).json(event);
});

router.patch('/:id', validate(eventIdSchema, 'params'), validate(updateEventSchema), findEvent, (req, res, next) => {
    const updated = { ...req.event, ...req.body };
    if (isDuplicate(updated, req.event.id)) return next(duplicateError());
    Object.assign(req.event, req.body);
    res.json(req.event);
});

router.delete('/:id', validate(eventIdSchema, 'params'), findEvent, (req, res) => {
    events.splice(events.indexOf(req.event), 1);
    res.status(204).end();
});

export default router;
