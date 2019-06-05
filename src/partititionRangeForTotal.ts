import { Range } from "./interfaces";

export function partitionRangeForTotal(
  total: number,
  partition: number,
  partitions: number,
): Range {
  const sizes = Array(partitions).fill(0);

  for (let i = 0; i < total; i++) {
    sizes[i % partitions]++;
  }

  const start = sizes
    .slice(0, partition)
    .reduce((memo, size) => memo + size, 0);
  const end = start + sizes[partition];

  return { start, end };
}
