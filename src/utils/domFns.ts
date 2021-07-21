import { findInArray, int, isFunction } from './shims';
import browserPrefix, { browserPrefixToKey } from './getPrefix';

import { ControlPosition, EventHandler, PositionOffsetControlPosition } from './types';

let matchesSelectorFunc = '';

export function matchesSelector(el: Node, selector: string): boolean {
  if (!matchesSelectorFunc) {
    matchesSelectorFunc = findInArray(
      ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'],
      function (method: any) {
        // @ts-ignore
        return isFunction(el[method]);
      }
    );
  }

  // Might not be found entirely (not an Element?) - in that case, bail
  // @ts-ignore
  if (!isFunction(el[matchesSelectorFunc])) return false;

  // @ts-ignore
  return el[matchesSelectorFunc](selector);
}

// Works up the tree to the draggable itself attempting to match selector.
export function matchesSelectorAndParentsTo(el: Node, selector: string, baseNode: Node): boolean {
  let node = el;
  do {
    if (matchesSelector(node, selector)) return true;
    if (node === baseNode) return false;
    node = node.parentNode as Node;
  } while (node);

  return false;
}

export function addEvent(el: Node, event: string, handler: EventHandler<any>, inputOptions?: Record<string, any>): void {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  if (el.addEventListener) {
    el.addEventListener(event, handler as any, options);
  } else {
    // @ts-ignore
    el['on' + event] = handler;
  }
}

export function removeEvent(el: Node, event: string, handler: EventHandler<any>, inputOptions?: Record<string, any>): void {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  if (el.removeEventListener) {
    el.removeEventListener(event, handler as any, options);
  } else {
    // @ts-ignore
    el['on' + event] = null;
  }
}

export function outerHeight(node: HTMLElement): number {
  // This is deliberately excluding margin for our calculations, since we are using
  // offsetTop which is including margin. See getBoundPosition
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node);
  height += int(computedStyle?.borderTopWidth as string);
  height += int(computedStyle?.borderBottomWidth as string);
  return height;
}

export function outerWidth(node: HTMLElement): number {
  // This is deliberately excluding margin for our calculations, since we are using
  // offsetLeft which is including margin. See getBoundPosition
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node);
  width += int(computedStyle?.borderLeftWidth as string);
  width += int(computedStyle?.borderRightWidth as string);
  return width;
}

export function innerHeight(node: HTMLElement): number {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node);
  height -= int(computedStyle?.paddingTop as string);
  height -= int(computedStyle?.paddingBottom as string);
  return height;
}

export function innerWidth(node: HTMLElement): number {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node);
  width -= int(computedStyle?.paddingLeft as string);
  width -= int(computedStyle?.paddingRight as string);
  return width;
}

// Get from offsetParent
export function offsetXYFromParent(evt: { x: number; y: number }, offsetParent: Element, scale: number): ControlPosition {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();

  const x = (evt.x + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (evt.y + offsetParent.scrollTop - offsetParentRect.top) / scale;

  return { x, y };
}

export function createCSSTransform(
  controlPos: ControlPosition,
  positionOffset?: PositionOffsetControlPosition
): Record<string, string> {
  const translation = getTranslation(controlPos, 'px', positionOffset);
  return { [browserPrefixToKey('transform', browserPrefix)]: translation };
}

export function createSVGTransform(controlPos: ControlPosition, positionOffset?: PositionOffsetControlPosition): string {
  return getTranslation(controlPos, '', positionOffset);
}

export function getTranslation(
  { x, y }: ControlPosition,
  unitSuffix = 'px',
  positionOffset?: PositionOffsetControlPosition
): string {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
  if (positionOffset) {
    const defaultX = `${typeof positionOffset.x === 'string' ? positionOffset.x : positionOffset.x + unitSuffix}`;
    const defaultY = `${typeof positionOffset.y === 'string' ? positionOffset.y : positionOffset.y + unitSuffix}`;
    translation = `translate(${defaultX}, ${defaultY})` + translation;
  }
  return translation;
}

export function addUserSelectStyles(doc: Document): void {
  if (!doc) return;
  let styleEl = doc.getElementById('revue-draggable-style-el');
  if (!styleEl) {
    styleEl = doc.createElement('style');
    (styleEl as any).type = 'text/css';
    styleEl.id = 'revue-draggable-style-el';
    styleEl.innerHTML = '.revue-draggable-transparent-selection *::-moz-selection {all: inherit;}\n';
    styleEl.innerHTML += '.revue-draggable-transparent-selection *::selection {all: inherit;}\n';
    doc.getElementsByTagName('head')[0].appendChild(styleEl);
  }
  if (doc.body) addClassName(doc.body, 'revue-draggable-transparent-selection');
}

export function removeUserSelectStyles(doc: Document): void {
  if (!doc) return;
  try {
    if (doc.body) removeClassName(doc.body, 'revue-draggable-transparent-selection');
    const selection = (doc.defaultView || window).getSelection();
    if (selection && selection.type !== 'Caret') {
      selection.removeAllRanges();
    }
  } catch (e) {
    // probably IE
  }
}

export function addClassName(el: HTMLElement, className: string): void {
  if (el.classList) {
    el.classList.add(className);
  } else {
    if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
      el.className += ` ${className}`;
    }
  }
}

export function removeClassName(el: HTMLElement, className: string): void {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g'), '');
  }
}
