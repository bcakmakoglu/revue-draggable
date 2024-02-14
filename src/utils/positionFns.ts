import { int, isNum, isTouch } from './shims'
import { getTouch, innerHeight, innerWidth, offsetXYFromParent, outerHeight, outerWidth } from './domFns'
import type { Bounds, ControlPosition, DraggableData, DraggableOptions, MouseTouchEvent } from './types'

export function getBoundPosition({
  bounds,
  x,
  y,
  node,
}: {
  bounds: any
  x: number
  y: number
  node: HTMLElement | SVGElement
}): [number, number] {
  // If no bounds, short-circuit and move on
  if (!bounds) {
    return [x, y]
  }
  // Clone new bounds
  bounds = typeof bounds === 'string' ? bounds : cloneBounds(bounds)

  if (typeof bounds === 'string') {
    const { ownerDocument } = node
    const ownerWindow = ownerDocument.defaultView
    const boundNode = bounds === 'parent' ? node.parentNode : ownerDocument.querySelector(bounds)
    if (!(ownerWindow && boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error(`Bounds selector "${bounds}" could not find an element.`)
    }
    const nodeStyle = ownerWindow.getComputedStyle(node)
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNode)
    const offsetLeft = 'offsetLeft' in node ? node.offsetLeft : 0
    const offsetTop = 'offsetTop' in node ? node.offsetTop : 0

    // Compute bounds. This is a pain with padding and offsets but this gets it exactly right.
    bounds = {
      left: -(offsetLeft - boundNode.offsetLeft) + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -(offsetTop - boundNode.offsetTop) + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right:
        innerWidth(boundNode) - outerWidth(node) - offsetLeft + int(boundNodeStyle.paddingRight) - int(nodeStyle.marginRight),
      bottom:
        innerHeight(boundNode) - outerHeight(node) - offsetTop + int(boundNodeStyle.paddingBottom) - int(nodeStyle.marginBottom),
    }
  }

  // Keep x and y below right and bottom limits...
  if (isNum(bounds.right)) {
    x = Math.min(x, bounds.right)
  }
  if (isNum(bounds.bottom)) {
    y = Math.min(y, bounds.bottom)
  }

  // But above left and top limits.
  if (isNum(bounds.left)) {
    x = Math.max(x, bounds.left)
  }
  if (isNum(bounds.top)) {
    y = Math.max(y, bounds.top)
  }

  return [x, y]
}

export function snapToGrid(grid: [number, number], pendingX: number, pendingY: number): [number, number] {
  const x = Math.round(pendingX / grid[0]) * grid[0]
  const y = Math.round(pendingY / grid[1]) * grid[1]
  return [x, y]
}

export function canDragX(axis: DraggableOptions['axis']): boolean {
  return axis === 'both' || axis === 'x'
}

export function canDragY(axis: DraggableOptions['axis']): boolean {
  return axis === 'both' || axis === 'y'
}

export function getControlPosition({
  e,
  touch,
  node,
  offsetContainer,
  scale,
}: {
  e: MouseTouchEvent
  touch: number | undefined
  node: HTMLElement | SVGElement
  offsetContainer?: HTMLElement
  scale: number
}): ControlPosition | null {
  const touchObj = typeof touch === 'number' && isTouch(e) ? getTouch(e, touch) : null
  if (typeof touch === 'number' && !touchObj) {
    return null
  } // not the right touch
  const offsetParent = offsetContainer || ('offsetParent' in node && node.offsetParent) || node.ownerDocument.body
  return offsetXYFromParent(touchObj || <MouseEvent>e, offsetParent, scale)
}

export function createCoreData({
  node,
  x,
  y,
  lastX,
  lastY,
}: {
  node: HTMLElement | SVGElement
  x: number
  y: number
  lastX: number
  lastY: number
}): DraggableData {
  const isStart = Number.isNaN(lastX)
  if (isStart) {
    // If this is our first move, use the x and y as last coords.
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y,
    }
  } else {
    // Otherwise calculate proper values.
    return {
      node,
      deltaX: x - lastX,
      deltaY: y - lastY,
      lastX,
      lastY,
      x,
      y,
    }
  }
}

export function createDraggableData({ x, y, data }: { x: number; y: number; data: DraggableData }): DraggableData {
  return {
    node: data.node,
    x: x + data.deltaX,
    y: y + data.deltaY,
    deltaX: data.deltaX,
    deltaY: data.deltaY,
    lastX: x,
    lastY: y,
  }
}

function cloneBounds(bounds: Bounds): Bounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
  }
}
