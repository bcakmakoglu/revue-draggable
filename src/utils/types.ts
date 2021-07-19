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

export interface DraggableProps extends DraggableCoreProps {
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
  style: Record<string, string> | false;
  transform: string | false;
  classes: {
    [x: string]: boolean;
  };
};

export interface DraggableCoreProps {
  allowAnyClick: boolean;
  cancel: string;
  disabled: boolean;
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

export interface UseDraggable {
  onDragStart: EventHookOn<DraggableHook>;
  onDrag: EventHookOn<DraggableHook>;
  onDragStop: EventHookOn<DraggableHook>;
  onTransformed: EventHookOn<TransformedData>;
}

export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;

export interface DraggableHook {
  event: MouseEvent;
  data: DraggableData;
}
