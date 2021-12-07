export function log(...args: any[]): void {
  if (typeof process !== 'undefined' && process.env.DRAGGABLE_DEBUG) console.log(...args)
}
