export function log(...args: any[]): void {
  // eslint-disable-next-line n/prefer-global/process
  if (typeof process !== 'undefined' && process.env.DRAGGABLE_DEBUG) {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}
