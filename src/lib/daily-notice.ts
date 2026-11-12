export function shouldShowDailyNotice(lastShown: string | null, today: string): boolean {
  return lastShown !== today;
}

export function localDateStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
