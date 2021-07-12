export default function log(...args: any) {
  if (typeof process !== 'undefined' && process.env.DRAGGABLE_DEBUG) console.log(...args);
}
