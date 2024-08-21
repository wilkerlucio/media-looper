export function partition(coll: any[], size: number, step = size) {
  const result = [];
  for (let i = 0; i <= coll.length - size; i += step) {
    result.push(coll.slice(i, i + size));
  }
  return result;
}

export function keep<U, T>(arr: U[], callback: (item: U) => T | undefined): NonNullable<T>[] {
  return arr
    .map(callback)
    .filter((x): x is NonNullable<T> => x != null);
}
