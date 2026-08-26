export function countLabel(count, singular, plural = `${singular}s`) {
  const value = Number(count) || 0;
  return `${value} ${value === 1 ? singular : plural}`;
}