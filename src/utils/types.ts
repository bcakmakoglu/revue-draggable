import { EventHookOn } from '@vueuse/core';
import { Ref } from 'vue-demi';

export type DraggableData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

export type Bounds = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
};
export type ControlPosition = { x: number; y: number };
export type PositionOffsetControlPosition = { x: number | string; y: number | string };
export type EventHandler<T> = (e: T) => void | false;

export type MouseTouchEvent = MouseEvent & TouchEvent;

export interface DraggableBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface DraggableOptions extends DraggableCoreOptions {
  axis: 'both' | 'x' | 'y' | 'none';
  bounds: DraggableBounds | string | false;
  defaultClassName: string;
  defaultClassNameDragging: string;
  defaultClassNameDragged: string;
  defaultPosition: ControlPosition;
  positionOffset?: PositionOffsetControlPosition;
  position?: ControlPosition;
}

export interface DraggableCoreOptions {
  allowAnyClick: boolean;
  enableUserSelectHack: boolean;
  disabled: boolean;
  update: boolean;
  offsetParent?: HTMLElement;
  grid?: [number, number];
  handle: string;
  cancel: string;
  scale: number;
  start: DraggableEventHandler;
  move: DraggableEventHandler;
  stop: DraggableEventHandler;
}

export type DraggableCoreState = State & DraggableCoreOptions;

export type DraggableState = State & DraggableOptions;

interface State {
  dragging: boolean;
  dragged: boolean;
  x: number;
  y: number;
  prevPropsPosition: { x: number; y: number };
  slackX: number;
  slackY: number;
  isElementSVG: boolean;
  touch?: number;
}

export interface UseDraggable {
  onDragStart: EventHookOn<DraggableEvent>;
  onDrag: EventHookOn<DraggableEvent>;
  onDragStop: EventHookOn<DraggableEvent>;
  onTransformed: EventHookOn<TransformEvent>;
  onUpdated: EventHookOn<Partial<DraggableState>>;
  state: Ref<Partial<DraggableState>>;
}

export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;

export interface DraggableEvent {
  event: MouseEvent;
  data: DraggableData;
}

export interface TransformEvent {
  el: any;
  style: Record<string, string> | false;
  transform: string | false;
  classes: {
    [x: string]: boolean;
  };
}

export type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;
export type DraggableEventListener = (draggableEvent: DraggableEvent) => any;
