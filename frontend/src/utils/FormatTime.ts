export const normalizeTime = (time: string) => {
  const parts = time.split(':').map(Number);

  const hours = parts[0];
  const minutes = parts[1] ?? 0;

  const days = Math.floor(hours / 24);
  const normalizedHours = hours % 24;

  const hh = String(normalizedHours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return {
    time: `${hh}:${mm}`,
    daysOffset: days > 0 ? `+${days}d` : '',
  };
}