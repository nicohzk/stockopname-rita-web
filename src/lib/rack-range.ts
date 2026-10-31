import type { Rack } from "@/types/rack";

function rackNumber(name: string): number | undefined {
  const match = /^Rak (\d+)$/.exec(name.trim());
  return match ? Number(match[1]) : undefined;
}

function formatNumericRange(start: number, end: number): string {
  return start === end ? `Rak ${start}` : `Rak ${start} - Rak ${end}`;
}

export function formatRackRange(racks: Rack[]): string {
  if (racks.length === 0) return "-";

  const names = Array.from(new Set(racks.map((rack) => rack.name.trim()).filter(Boolean)));
  if (names.length === 0) return "-";

  const numbers = names.map(rackNumber);
  if (numbers.some((number) => number === undefined)) {
    return names.sort((a, b) => a.localeCompare(b, "id", { numeric: true })).join(", ");
  }

  const sorted = (numbers as number[]).sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let previous = start;

  for (const number of sorted.slice(1)) {
    if (number === previous + 1) {
      previous = number;
      continue;
    }
    parts.push(formatNumericRange(start, previous));
    start = number;
    previous = number;
  }
  parts.push(formatNumericRange(start, previous));
  return parts.join(", ");
}
