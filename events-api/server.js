import express from 'express';
import { randomUUID } from 'node:crypto';
import { readEvents, writeEvents } from './fileEventStore.js';
import eventsRouter from './routes/events.router.js';
import { requestId } from './middleware/requestId.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { validate } from './middleware/validate.js';
import { createEventSchema } from './schemas/event.schemas.js';

const app = express();

app.use(requestId);
app.use(logger);
app.use(express.json());
app.use('/api/events', eventsRouter);

app.get('/api/events-from-file', async (req, res, next) => {
    try {
        res.json(await readEvents());
    } catch (error) {
        next(error);
    }
});

app.post('/api/events-from-file', validate(createEventSchema), async (req, res, next) => {
    try {
        const events = await readEvents();
        const newEvent = { id: randomUUID(), ...req.body };
        events.push(newEvent);
        await writeEvents(events);
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
});

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`Server started on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});
