import { DraggableCoreProps, EventHandler, MouseTouchEvent, UseDraggableCore } from '../utils/types';
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
import { onBeforeUnmount } from 'vue-demi';

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
}: Partial<DraggableCoreProps>): UseDraggableCore => {
  if (!nodeRef) {
    console.warn(
      'You are trying to use <DraggableCore> without passing a valid node reference. This will cause errors down the line.'
    );
  }
  let dragging = false;
  let lastX = NaN;
  let lastY = NaN;
  let touchIdentifier: number | undefined = NaN;

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
    touchIdentifier = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touchIdentifier,
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
      lastX: lastX,
      lastY: lastY
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);
    log('calling', onStart);

    const shouldUpdate = onStart(e, coreEvent);
    if (shouldUpdate === false) return;

    if (enableUserSelectHack) addUserSelectStyles(ownerDocument);

    dragging = true;
    lastX = x;
    lastY = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    if (nodeRef) {
      const position = getControlPosition({
        e,
        touchIdentifier,
        node: nodeRef,
        offsetContainer: offsetParent,
        scale: scale
      });
      if (position == null) return;
      let { x, y } = position;

      // Snap to grid if prop has been provided
      if (Array.isArray(grid)) {
        let deltaX = x - lastX,
          deltaY = y - lastY;
        [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = lastX + deltaX;
        y = lastY + deltaY;
      }

      const coreEvent = createCoreData({
        node: nodeRef,
        x,
        y,
        lastX: lastX,
        lastY: lastY
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

      lastX = x;
      lastY = y;
    }
  };

  const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
    if (!dragging) return;

    if (nodeRef) {
      const position = getControlPosition({
        e,
        touchIdentifier,
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
        lastX: lastX,
        lastY: lastY
      });

      const shouldContinue = onStop(e, coreEvent);
      if (shouldContinue === false) return false;

      if (nodeRef) {
        if (enableUserSelectHack) removeUserSelectStyles(nodeRef.ownerDocument as any);
      }

      log('DraggableCore: handleDragStop: %j', coreEvent);

      dragging = false;
      lastX = NaN;
      lastY = NaN;

      if (nodeRef) {
        log('DraggableCore: Removing handlers');
        removeEvent(nodeRef.ownerDocument, dragEventFor.move, handleDrag);
        removeEvent(nodeRef.ownerDocument, dragEventFor.stop, handleDragStop);
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
      if (nodeRef) {
        addEvent(nodeRef, eventsFor.touch.start, onTouchStart, { passive: false });
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

  onBeforeUnmount(() => {
    lifeCycleHooks.onBeforeUnmount();
  });

  lifeCycleHooks.onMounted();
  return {
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    onTouchStart,
    ...lifeCycleHooks
  };
};

export default useDraggableCore;
