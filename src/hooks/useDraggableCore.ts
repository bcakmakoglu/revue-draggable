import { getCurrentInstance, onBeforeUnmount } from 'vue-demi';
import { createEventHook } from '@vueuse/core';
import {
  DraggableCoreOptions,
  DraggableCoreState,
  DraggableHook, DraggableState,
  EventHandler,
  MouseTouchEvent,
  UseDraggableCore
} from '../utils/types';
import {
  addEvent,
  addUserSelectStyles,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles
} from '../utils/domFns';
import { createCoreData, getControlPosition, snapToGrid } from '../utils/positionFns';
import log from '../utils/log';
import { isFunction } from '../utils/shims';

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

const useDraggableCoreState = (state: Partial<DraggableCoreState> = {}) => ({
  _state: state as DraggableCoreState,
  get state() {
    return this._state;
  },
  set state(state: DraggableCoreState) {
    Object.assign(this._state, state);
  }
});

const useDraggableCore = ({
  nodeRef,
  enableUserSelectHack = true,
  allowAnyClick = true,
  disabled = false,
  offsetParent,
  grid,
  handle,
  cancel,
  scale = 1,
  onStart = () => {},
  onStop = () => {},
  onDrag = () => {},
  onMouseDown: onMouseDownProp = () => {}
}: Partial<DraggableCoreOptions>): UseDraggableCore => {
  if (!nodeRef) {
    console.warn(
      'You are trying to use <DraggableCore> without passing a valid node reference. This will cause errors down the line.'
    );
  }


  const draggable = useDraggableCoreState({
    nodeRef,
    enableUserSelectHack,
    allowAnyClick,
    disabled,
    offsetParent,
    grid,
    handle,
    cancel,
    scale,
    onStart,
    onStop,
    onDrag,
    onMouseDown: onMouseDownProp,
    dragging: false,
    x: NaN,
    y: NaN,
    touchIdentifier: NaN
  });

  const onDragStartHook = createEventHook<DraggableHook>(),
    onDragHook = createEventHook<DraggableHook>(),
    onDragStopHook = createEventHook<DraggableHook>(),
    onUpdateHook = createEventHook<Partial<DraggableCoreState>>(),
    instance = getCurrentInstance(),
    emitter =
      instance?.emit ??
      ((arg, data) => {
        const event = new CustomEvent(arg, data);
        nodeRef?.dispatchEvent(event);
      });

  const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
    if (isFunction(draggable.state.onMouseDown)) {
      draggable.state.onMouseDown(e);
    }

    if (!draggable.state.allowAnyClick && e.button !== 0) return false;

    if (!draggable.state.nodeRef || !draggable.state.nodeRef.ownerDocument || !draggable.state.nodeRef.ownerDocument.body) {
      throw new Error('<DraggableCore> not mounted on DragStart!');
    }
    const { ownerDocument } = draggable.state.nodeRef;

    if (
      disabled ||
      !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
      (handle && !matchesSelectorAndParentsTo(e.target, draggable.state.handle, draggable.state.nodeRef)) ||
      (cancel && matchesSelectorAndParentsTo(e.target, draggable.state.cancel, draggable.state.nodeRef))
    ) {
      return;
    }

    if (e.type === 'touchstart') e.preventDefault();
    draggable.state.touchIdentifier = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touchIdentifier: draggable.state.touchIdentifier,
      node: draggable.state.nodeRef,
      offsetContainer: draggable.state.offsetParent,
      scale: draggable.state.scale
    });
    if (position == null) return;
    const { x, y } = position;

    const coreEvent = createCoreData({
      node: draggable.state.nodeRef,
      x,
      y,
      lastX: draggable.state.x,
      lastY: draggable.state.y
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);
    log('calling', onStart);

    const shouldUpdate = onStart(e, coreEvent);
    emitter('core-start', { event: e, data: coreEvent });
    onDragStartHook.trigger({ event: e, data: coreEvent });
    if (shouldUpdate === false) return;

    if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

    draggable.state.dragging = true;
    draggable.state.x = x;
    draggable.state.y = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    if (draggable.state.nodeRef) {
      const position = getControlPosition({
        e,
        touchIdentifier: draggable.state.touchIdentifier,
        node: draggable.state.nodeRef,
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
        node: draggable.state.nodeRef,
        x,
        y,
        lastX: draggable.state.x,
        lastY: draggable.state.y
      });

      log('DraggableCore: handleDrag: %j', coreEvent);

      const shouldUpdate = onDrag(e, coreEvent);
      emitter('core-move', { event: e, data: coreEvent});
      onDragHook.trigger({ event: e, data: coreEvent });
      if (shouldUpdate === false) {
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

    if (draggable.state.nodeRef) {
      const position = getControlPosition({
        e,
        touchIdentifier: draggable.state.touchIdentifier,
        node: draggable.state.nodeRef,
        offsetContainer: offsetParent,
        scale: draggable.state.scale
      });
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData({
        node: draggable.state.nodeRef,
        x,
        y,
        lastX: draggable.state.x,
        lastY: draggable.state.y
      });

      const shouldContinue = onStop(e, coreEvent);
      emitter('core-stop', { event: e, data: coreEvent });
      onDragStopHook.trigger({ event: e, data: coreEvent });
      if (shouldContinue === false) return false;

      if (draggable.state.nodeRef) {
        if (draggable.state.enableUserSelectHack) removeUserSelectStyles(draggable.state.nodeRef.ownerDocument);
      }

      log('DraggableCore: handleDragStop: %j', coreEvent);

      draggable.state.dragging = false;
      draggable.state.x = NaN;
      draggable.state.y = NaN;

      if (draggable.state.nodeRef) {
        log('DraggableCore: Removing handlers');
        removeEvent(draggable.state.nodeRef.ownerDocument, dragEventFor.move, handleDrag);
        removeEvent(draggable.state.nodeRef.ownerDocument, dragEventFor.stop, handleDragStop);
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

  const lifeCycleHooks = {
    onMounted: () => {
      if (draggable.state.nodeRef) {
        addEvent(draggable.state.nodeRef, eventsFor.touch.start, onTouchStart, { passive: false });
        addEvent(draggable.state.nodeRef, eventsFor.touch.stop, onTouchEnd);
        addEvent(draggable.state.nodeRef, eventsFor.mouse.start, onMouseDown);
        addEvent(draggable.state.nodeRef, eventsFor.mouse.stop, onMouseUp);
      }
    },

    onBeforeUnmount: () => {
      if (draggable.state.nodeRef) {
        const { ownerDocument } = draggable.state.nodeRef;
        removeEvent(ownerDocument, eventsFor.mouse.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.touch.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.mouse.stop, handleDragStop);
        removeEvent(ownerDocument, eventsFor.touch.stop, handleDragStop);
        removeEvent(draggable.state.nodeRef, eventsFor.touch.start, onTouchStart, { passive: false });
        if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
      }
    }
  };

  if (instance) {
    onBeforeUnmount(() => {
      lifeCycleHooks.onBeforeUnmount();
    }, instance);
  }

  onUpdateHook.on((state) => {
    log('DraggableCore: State Updated %j', state);
    draggable.state = state as DraggableState;
  });

  lifeCycleHooks.onMounted();
  return {
    updateState: (state) => {
      onUpdateHook.trigger(state);
      return draggable.state;
    },
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on
  };
};

export default useDraggableCore;
