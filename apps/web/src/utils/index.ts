export function cloneDeep<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function isArray(x: any): x is [] {
  return Array.isArray(x)
}

export function isNumber(x: any): x is number {
  return typeof x === 'number'
}

export function isString(x: any): x is string {
  return typeof x === 'string'
}
