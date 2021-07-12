// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
export function findInArray(array: Array<any> | TouchList, callback: (...args: any[]) => any): any {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) return array[i];
  }
}

export function isFunction(func: (...args: any[]) => any): boolean {
  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
}

export function isNum(num: number): boolean {
  return !isNaN(num);
}

export function int(a: string): number {
  return parseInt(a, 10);
}
