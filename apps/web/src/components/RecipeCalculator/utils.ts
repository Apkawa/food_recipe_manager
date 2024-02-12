export function valueDisplay(value?: number | number[]): string {
  let v = ''
  if (value) {
    v = value.toString()
    if (Array.isArray(value)) {
      v = value.join(' - ')
    }
  }
  return v
}
