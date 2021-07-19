import { watchEffect } from 'vue-demi';
import { createEventHook, MaybeRef, unrefElement, useEventListener } from '@vueuse/core';
import {
  DraggableCoreOptions,
  DraggableCoreState,
  DraggableEvent,
  DraggableState,
  EventHandler,
  MouseTouchEvent,
  UseDraggableCore
} from '../utils/types';
import {
  addUserSelectStyles,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles
} from '../utils/domFns';
import { createCoreData, getControlPosition, snapToGrid } from '../utils/positionFns';
import log from '../utils/log';
import { addEvent } from '../utils/domFns';

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
};

// Default to mouse events.
let dragEventFor = eventsFor.mouse;

const useDraggableCoreState = (target: MaybeRef<any>, state: Partial<DraggableCoreState> = {}) => ({
  _state: state as DraggableCoreState,
  _node: target,
  get state() {
    return this._state;
  },
  set state(state: DraggableCoreState) {
    Object.assign(this._state, state);
  },
  get node() {
    return unrefElement(this._node);
  }
});

const useDraggableCore = (
  target: MaybeRef<any>,
  {
    enableUserSelectHack = true,
    allowAnyClick = true,
    disabled = false,
    offsetParent,
    grid,
    handle,
    cancel,
    scale = 1
  }: Partial<DraggableCoreOptions>
): UseDraggableCore => {
  if (!target) {
    console.warn(
      'You are trying to use <DraggableCore> without passing a valid node reference. This will cause errors down the line.'
    );
  }

  const draggable = useDraggableCoreState(target, {
    enableUserSelectHack,
    allowAnyClick,
    disabled,
    offsetParent,
    grid,
    handle,
    cancel,
    scale,
    dragging: false,
    x: NaN,
    y: NaN,
    touch: NaN
  });

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onUpdateHook = createEventHook<Partial<DraggableCoreState>>();

  const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
    if (!draggable.state.allowAnyClick && e.button !== 0) return false;

    if (!draggable.node || !draggable.node.ownerDocument || !draggable.node.ownerDocument.body) {
      throw new Error('<DraggableCore> not mounted on DragStart!');
    }
    const { ownerDocument } = draggable.node;

    if (
      draggable.state.disabled ||
      !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
      (draggable.state.handle && !matchesSelectorAndParentsTo(e.target as Node, draggable.state.handle, draggable.node)) ||
      (draggable.state.cancel && matchesSelectorAndParentsTo(e.target as Node, draggable.state.cancel, draggable.node))
    ) {
      return;
    }

    const isTouch = e.type === 'touchstart';
    if (isTouch) e.preventDefault();
    draggable.state.touch = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touch: draggable.state.touch,
      node: draggable.node,
      offsetContainer: draggable.state.offsetParent,
      scale: draggable.state.scale
    });
    if (position == null) return;
    const { x, y } = position;

    const coreEvent = createCoreData({
      node: draggable.node,
      x,
      y,
      lastX: draggable.state.x,
      lastY: draggable.state.y
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);

    onDragStartHook.trigger({ event: e, data: coreEvent });
    if (draggable.state.update === false) return false;

    if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

    draggable.state.dragging = true;
    draggable.state.x = x;
    draggable.state.y = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    if (draggable.node) {
      const position = getControlPosition({
        e,
        touch: draggable.state.touch,
        node: draggable.node,
        offsetContainer: draggable.state.offsetParent,
        scale: draggable.state.scale
      });
      if (position == null) return;
      let { x, y } = position;

      // Snap to grid if prop has been provided
      if (Array.isArray(grid)) {
        let deltaX = x - draggable.state.x,
          deltaY = y - draggable.state.y;
        [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = draggable.state.x + deltaX;
        y = draggable.state.y + deltaY;
      }

      const coreEvent = createCoreData({
        node: draggable.node,
        x,
        y,
        lastX: draggable.state.x,
        lastY: draggable.state.y
      });

      log('DraggableCore: handleDrag: %j', coreEvent);

      onDragHook.trigger({ event: e, data: coreEvent });
      if (draggable.state.update === false) {
        try {
          handleDragStop(new MouseEvent('mouseup') as MouseTouchEvent);
        } catch (err) {
          // Old browsers
          const event = document.createEvent('MouseEvents') as MouseTouchEvent;
          // I see why this insanity was deprecated
          event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          handleDragStop(event);
        }
        return;
      }

      draggable.state.x = x;
      draggable.state.y = y;
    }
  };

  const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
    if (!draggable.state.dragging) return;

    if (draggable.node) {
      const position = getControlPosition({
        e,
        touch: draggable.state.touch,
        node: draggable.node,
        offsetContainer: offsetParent,
        scale: draggable.state.scale
      });
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData({
        node: draggable.node,
        x,
        y,
        lastX: draggable.state.x,
        lastY: draggable.state.y
      });

      onDragStopHook.trigger({ event: e, data: coreEvent });
      if (draggable.state.update === false) return false;

      if (draggable.node) {
        if (draggable.state.enableUserSelectHack) removeUserSelectStyles(draggable.node.ownerDocument);
      }

      log('DraggableCore: handleDragStop: %j', coreEvent);

      draggable.state.dragging = false;
      draggable.state.x = NaN;
      draggable.state.y = NaN;

      if (draggable.node) {
        log('DraggableCore: Removing handlers');
        removeEvent(draggable.node.ownerDocument, dragEventFor.move, handleDrag);
        removeEvent(draggable.node.ownerDocument, dragEventFor.stop, handleDragStop);
      }
    }
  };

  const onMouseDown: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.mouse;
    return handleDragStart(e);
  };

  const onMouseUp: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.mouse;
    return handleDragStop(e);
  };

  const onTouchStart: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.touch;
    return handleDragStart(e);
  };

  const onTouchEnd: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.touch;
    return handleDragStop(e);
  };

  let initialized = false;
  const init = () => {
    if (draggable.node && !initialized) {
      initialized = true;
      useEventListener(draggable.node, eventsFor.touch.start, onTouchStart, { passive: false });
      useEventListener(draggable.node, eventsFor.touch.stop, onTouchEnd);
      useEventListener(draggable.node, eventsFor.mouse.start, onMouseDown);
      useEventListener(draggable.node, eventsFor.mouse.stop, onMouseUp);
    }
  };

  watchEffect(() => {
    init();
  });

  onUpdateHook.on((state) => {
    log('DraggableCore: State Updated %j', state);
    draggable.state = state as DraggableState;
  });

  return {
    updateState: (state) => {
      onUpdateHook.trigger(state);
      init();
      return draggable.state;
    },
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on
  };
};

export default useDraggableCore;
