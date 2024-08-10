export function partition(coll: any[], size: number, step = size) {
  const result = [];
  for (let i = 0; i <= coll.length - size; i += step) {
    result.push(coll.slice(i, i + size));
  }
  return result;
}
