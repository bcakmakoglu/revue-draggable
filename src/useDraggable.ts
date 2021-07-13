import { ref } from 'vue-demi';
import { DraggableCoreProps, EventHandler, MouseTouchEvent, UseDraggable } from './utils/types';
import {
  addEvent,
  addUserSelectStyles,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles
} from './utils/domFns';
import { createCoreData, getControlPosition, snapToGrid } from './utils/positionFns';
import log from './utils/log';
import { isFunction } from './utils/shims';

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

const useDraggable = (
  nodeRef: HTMLElement,
  {
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
  }: DraggableCoreProps
): UseDraggable => {
  const dragging = ref(false);
  const lastX = ref<number>(NaN);
  const lastY = ref<number>(NaN);
  const touchIdentifier = ref<number | undefined>();

  const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
    if (isFunction(onMouseDownProp)) {
      onMouseDownProp(e);
    }

    if (!allowAnyClick && e.button !== 0) return false;

    if (!nodeRef || !nodeRef.ownerDocument || !nodeRef.ownerDocument.body) {
      throw new Error('<DraggableCore> not mounted on DragStart!');
    }
    const { ownerDocument } = nodeRef;

    if (
      disabled ||
      !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
      (handle && !matchesSelectorAndParentsTo(e.target, handle, nodeRef)) ||
      (cancel && matchesSelectorAndParentsTo(e.target, cancel, nodeRef))
    ) {
      return;
    }

    if (e.type === 'touchstart') e.preventDefault();
    touchIdentifier.value = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touchIdentifier: touchIdentifier.value,
      node: nodeRef,
      offsetContainer: offsetParent,
      scale: scale
    });
    if (position == null) return;
    const { x, y } = position;

    const coreEvent = createCoreData({
      node: nodeRef,
      x,
      y,
      lastX: lastX.value,
      lastY: lastY.value
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);
    log('calling', onStart);

    const shouldUpdate = onStart(e, coreEvent);
    if (shouldUpdate === false) return;

    if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

    dragging.value = true;
    lastX.value = x;
    lastY.value = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    const position = getControlPosition({
      e,
      touchIdentifier: touchIdentifier.value,
      node: nodeRef,
      offsetContainer: offsetParent,
      scale: scale
    });
    if (position == null) return;
    let { x, y } = position;

    // Snap to grid if prop has been provided
    if (Array.isArray(grid)) {
      let deltaX = x - lastX.value,
        deltaY = y - lastY.value;
      [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
      if (!deltaX && !deltaY) return;
      x = lastX.value + deltaX;
      y = lastY.value + deltaY;
    }

    const coreEvent = createCoreData({
      node: nodeRef,
      x,
      y,
      lastX: lastX.value,
      lastY: lastY.value
    });

    log('DraggableCore: handleDrag: %j', coreEvent);

    const shouldUpdate = onDrag(e, coreEvent);
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

    lastX.value = x;
    lastY.value = y;
  };

  const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
    if (!dragging.value) return;

    const position = getControlPosition({
      e,
      touchIdentifier: touchIdentifier.value,
      node: nodeRef,
      offsetContainer: offsetParent,
      scale: scale
    });
    if (position == null) return;
    const { x, y } = position;
    const coreEvent = createCoreData({
      node: nodeRef,
      x,
      y,
      lastX: lastX.value,
      lastY: lastY.value
    });

    const shouldContinue = onStop(e, coreEvent);
    if (shouldContinue === false) return false;

    if (nodeRef) {
      if (enableUserSelectHack) removeUserSelectStyles(nodeRef.ownerDocument as any);
    }

    log('DraggableCore: handleDragStop: %j', coreEvent);

    dragging.value = false;
    lastX.value = NaN;
    lastY.value = NaN;

    if (nodeRef) {
      log('DraggableCore: Removing handlers');
      removeEvent(nodeRef.ownerDocument as any, dragEventFor.move, handleDrag);
      removeEvent(nodeRef.ownerDocument as any, dragEventFor.stop, handleDragStop);
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
      if (nodeRef) {
        addEvent(nodeRef as any, eventsFor.touch.start, onTouchStart, { passive: false });
      }
    },

    onBeforeUnmount: () => {
      if (nodeRef) {
        const { ownerDocument } = nodeRef;
        removeEvent(ownerDocument, eventsFor.mouse.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.touch.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.mouse.stop, handleDragStop);
        removeEvent(ownerDocument, eventsFor.touch.stop, handleDragStop);
        removeEvent(nodeRef, eventsFor.touch.start, onTouchStart, { passive: false });
        if (enableUserSelectHack) removeUserSelectStyles(ownerDocument);
      }
    }
  };

  return {
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    onTouchStart,
    ...lifeCycleHooks
  };
};

export default useDraggable;
