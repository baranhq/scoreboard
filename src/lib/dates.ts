export const MAX_DATE_TIMESTAMP = 8_640_000_000_000_000;

export function validTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_DATE_TIMESTAMP
  );
}

export function europeanDateTime(value: number): string {
  const date = new Date(value);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()}, ${two(date.getHours())}:${two(date.getMinutes())}`;
}
