export function findInArray(array: Array<any> | TouchList, callback: (...args: any[]) => any): any {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) {
      return array[i]
    }
  }
}

export function isFunction(func: unknown): func is (...args: any) => any {
  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]'
}

export function isTouch(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !!('targetTouches' in e && e.targetTouches && 'changedTouches' in e && e.changedTouches)
}

export function isNum(num: number): num is number {
  return !Number.isNaN(num)
}

export function int(a: string): number {
  return Number.parseInt(a, 10)
}
