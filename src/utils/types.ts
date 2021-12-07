import { EventHookOn } from '@vueuse/core'
import { ToRefs } from 'vue-demi'

export type DraggableData = {
  node: HTMLElement | SVGElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
}

export type Bounds = {
  left?: number
  top?: number
  right?: number
  bottom?: number
}

export type ControlPosition = { x: number; y: number }
export type PositionOffsetControlPosition = { x: number | string; y: number | string }
export type EventHandler<T extends Event> = (e: T) => void | false

export type MouseTouchEvent = MouseEvent | TouchEvent

export interface DraggableBounds {
  left?: number
  right?: number
  top?: number
  bottom?: number
}

export interface DraggableOptions extends DraggableCoreOptions {
  axis: 'both' | 'x' | 'y' | 'none'
  bounds: DraggableBounds | string | false
  enableTransformFix: boolean | { position: 'relative' | 'absolute' }
  defaultClassName: string
  defaultClassNameDragging: string
  defaultClassNameDragged: string
  defaultPosition: ControlPosition
  positionOffset?: PositionOffsetControlPosition
  position?: ControlPosition
}

export interface DraggableCoreOptions {
  allowAnyClick: boolean
  enableUserSelectHack: boolean
  disabled: boolean
  update: boolean
  offsetParent?: HTMLElement
  grid?: [number, number]
  handle: string
  cancel: string
  scale: number
  start: DraggableEventHandler
  move: DraggableEventHandler
  stop: DraggableEventHandler
  mouseDown: (e: MouseTouchEvent) => void
}

export type DraggableCoreState = State & DraggableCoreOptions

export type DraggableState = State &
  DraggableOptions & { currentPosition: ControlPosition; prevPropsPosition: { x: number; y: number }; isElementSVG: boolean }

interface State {
  dragging: boolean
  dragged: boolean
  touch?: number
}

export type UseDraggable = {
  onDragStart: EventHookOn<DraggableEvent>
  onDrag: EventHookOn<DraggableEvent>
  onDragStop: EventHookOn<DraggableEvent>
  onTransformed: EventHookOn<TransformEvent>
  state: Partial<DraggableState>
} & ToRefs<DraggableState>

export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>

export interface DraggableEvent {
  event: MouseTouchEvent
  data: DraggableData
}

export interface TransformEvent {
  el: any
  style: Record<string, string> | false
  transform: string | false
  classes: {
    [x: string]: boolean
  }
}

export type DraggableEventHandler = (e: MouseTouchEvent, data: DraggableData) => void | false
export type DraggableEventListener = (draggableEvent: DraggableEvent) => any
