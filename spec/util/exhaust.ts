/* eslint no-undef: off, no-unused-vars: off, @typescript-eslint/no-unused-vars: off */
export async function exhaust(
  asyncIterator: AsyncIterableIterator<any>,
): Promise<void> {
  for await (const _ of asyncIterator);
}
