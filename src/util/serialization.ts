export function map2obj<T>(map: Map<string, T>): Object {
  let obj = Object.create(null);
  for (let [k, v] of map) obj[k] = v instanceof Map ? map2obj(v) : v;
  return obj;
}

export function obj2map<T>(obj: Object) {
  let map = new Map<string, T>();
  for (let k of Object.keys(obj)) {
    map.set(k, obj[k]);
  }
  return map;
}