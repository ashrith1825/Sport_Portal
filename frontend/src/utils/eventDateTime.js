function pad(value) {
  return String(value).padStart(2, '0');
}

export function toDateTimeLocal(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateTimeToIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function getEndDateTimeMin(startValue, now = new Date()) {
  if (!startValue) return toDateTimeLocal(now);
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return toDateTimeLocal(now);

  return startValue;
}

export function getEventDateError(startValue, endValue, now = new Date()) {
  if (!startValue) return 'Choose an event start date and time';
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return 'Choose a valid event start date and time';
  if (!endValue) return '';

  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return 'Choose a valid event end date and time';
  if (end < start) return 'The end date and time must be after the start';

  const startsToday = start.getFullYear() === now.getFullYear()
    && start.getMonth() === now.getMonth()
    && start.getDate() === now.getDate();
  const endBeforeToday = end.getFullYear() < now.getFullYear()
    || (end.getFullYear() === now.getFullYear() && end.getMonth() < now.getMonth())
    || (end.getFullYear() === now.getFullYear() && end.getMonth() === now.getMonth() && end.getDate() < now.getDate());
  if (startsToday && endBeforeToday) return 'An event starting today cannot end before today';

  return '';
}