import { EventHookOn } from '@vueuse/core';

export type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;

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
  positionOffset: PositionOffsetControlPosition;
  position: ControlPosition;
}

export type TransformedData = {
  // el should be emitted too
  style: Record<string, string> | false;
  transform: string | false;
  classes: {
    [x: string]: boolean;
  };
};

export interface DraggableCoreOptions {
  allowAnyClick: boolean;
  cancel: string;
  disabled: boolean;
  update?: boolean;
  enableUserSelectHack: boolean;
  offsetParent: HTMLElement;
  grid: [number, number];
  handle: string;
  onStart: DraggableEventHandler;
  onDrag: DraggableEventHandler;
  onStop: DraggableEventHandler;
  onMouseDown: (e: MouseEvent) => void;
  scale: number;
  nodeRef: HTMLElement;
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
  touchIdentifier?: number;
}

export interface UseDraggable {
  onDragStart: EventHookOn<DraggableHook>;
  onDrag: EventHookOn<DraggableHook>;
  onDragStop: EventHookOn<DraggableHook>;
  onTransformed: EventHookOn<TransformedData>;
  updateState: (state: Partial<DraggableState>) => Partial<DraggableState> | void;
}

export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;

export interface DraggableHook {
  event: MouseEvent;
  data: DraggableData;
}
