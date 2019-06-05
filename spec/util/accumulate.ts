export async function accumulate(asyncIterator) {
  const collection = [];

  for await (const item of asyncIterator) {
    collection.push(item);
  }
  return collection;
}
