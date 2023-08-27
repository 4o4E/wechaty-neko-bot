export function any<T>(arr: T[], condition: (T) => boolean): boolean {
  for (let t of arr) {
    if (condition(t)) return true
  }
  return false;
}

export function first<T>(arr: T[], condition: (T) => boolean): T {
  for (let t of arr) {
    if (condition(t)) return t
  }
  return null;
}