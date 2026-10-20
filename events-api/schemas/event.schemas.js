import { z } from 'zod';

const eventFields = {
    title: z.string().trim()
        .min(3, 'Title must contain at least 3 characters')
        .max(100, 'Title must contain no more than 100 characters'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format'),
    description: z.string().trim().max(500).optional(),
    isOnline: z.boolean(),
};

export const createEventSchema = z.object({
    ...eventFields,
    isOnline: eventFields.isOnline.default(false),
}).strict();

// PATCH must not insert create defaults into fields that were not supplied.
export const updateEventSchema = z.object(eventFields).partial().strict()
    .refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export const eventIdSchema = z.object({
    id: z.coerce.number().int('Event id must be an integer')
        .positive('Event id must be positive'),
});

export const eventsQuerySchema = z.object({
    title: z.string().trim().min(1).max(100).optional(),
}).strict();
