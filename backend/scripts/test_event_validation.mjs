import assert from 'node:assert/strict';
import { getEventDateError } from '../src/utils/eventValidation.js';

const now = new Date('2026-10-28T12:00:00.000Z');

assert.equal(
  getEventDateError({
    eventDate: '2026-10-28T14:00:00.000Z',
    endDate: '2026-10-28T13:00:00.000Z',
    now,
  }),
  'The end date and time must be after the start'
);

assert.equal(
  getEventDateError({
    eventDate: '2026-10-28T10:00:00.000Z',
    endDate: '2026-10-28T11:00:00.000Z',
    now,
  }),
  null
);

assert.equal(
  getEventDateError({
    eventDate: '2026-10-28T14:00:00.000Z',
    endDate: '2026-10-28T15:00:00.000Z',
    now,
  }),
  null
);

assert.equal(
  getEventDateError({
    eventDate: '2026-10-27T10:00:00.000Z',
    endDate: '2026-10-27T11:00:00.000Z',
    now,
  }),
  null
);

assert.equal(
  getEventDateError({
    eventDate: '2026-10-28T01:00:00.000Z',
    endDate: '2026-10-28T02:00:00.000Z',
    timezoneOffsetMinutes: -600,
    now,
  }),
  null
);

console.log('Event date validation checks passed.');