export function getEventDateError({
  eventDate,
  endDate,
  timezoneOffsetMinutes = 0,
  now = new Date(),
  checkCurrentDay = true,
}) {
  const startTime = new Date(eventDate).getTime();
  if (!Number.isFinite(startTime)) return 'Enter a valid event start date and time';
  if (!endDate) return null;

  const endTime = new Date(endDate).getTime();
  if (!Number.isFinite(endTime)) return 'Enter a valid event end date and time';
  if (endTime < startTime) return 'The end date and time must be after the start';

  const offset = Number(timezoneOffsetMinutes);
  if (!checkCurrentDay || !Number.isFinite(offset) || Math.abs(offset) > 840) return null;

  const offsetMs = offset * 60_000;
  const localStart = new Date(startTime - offsetMs);
  const localToday = new Date(now.getTime() - offsetMs);
  const startsToday = localStart.getUTCFullYear() === localToday.getUTCFullYear()
    && localStart.getUTCMonth() === localToday.getUTCMonth()
    && localStart.getUTCDate() === localToday.getUTCDate();
  const localEnd = new Date(endTime - offsetMs);
  const endBeforeToday = localEnd.getUTCFullYear() < localToday.getUTCFullYear()
    || (localEnd.getUTCFullYear() === localToday.getUTCFullYear() && localEnd.getUTCMonth() < localToday.getUTCMonth())
    || (localEnd.getUTCFullYear() === localToday.getUTCFullYear() && localEnd.getUTCMonth() === localToday.getUTCMonth() && localEnd.getUTCDate() < localToday.getUTCDate());

  if (startsToday && endBeforeToday) return 'An event starting today cannot end before today';

  return null;
}