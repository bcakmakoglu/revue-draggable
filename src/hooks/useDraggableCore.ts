import { ref, watch } from 'vue-demi';
import { get, createEventHook, MaybeRef, unrefElement, useEventListener, tryOnMounted } from '@vueuse/core';
import {
  DraggableCoreOptions,
  DraggableCoreState,
  DraggableEvent,
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

const useDraggableCore = (target: MaybeRef<any>, options?: Partial<DraggableCoreOptions>): UseDraggableCore => {
  const initState = (initialState?: Partial<DraggableCoreState>): DraggableCoreState =>
    Object.assign(
      {
        enableUserSelectHack: true,
        allowAnyClick: true,
        disabled: false,
        offsetParent: undefined,
        grid: undefined,
        handle: '',
        cancel: '',
        dragged: false,
        update: true,
        scale: 1,
        dragging: false,
        touch: 0,
        start: () => {},
        move: () => {},
        stop: () => {},
        mouseDown: () => {},
        position: undefined
      },
      initialState
    );
  const pos = ref([NaN, NaN]);

  const node = ref<HTMLElement | SVGElement>();
  const state = ref<DraggableCoreState>(initState(options));
  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>();

  tryOnMounted(() => {
    watch(
      () => get(state),
      (val) => {
        if (val.position && !val.dragging) {
          get(pos)[0] = NaN;
          get(pos)[1] = NaN;
        }
      }
    );
  });

  const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
    const n = get(node);
    if (!get(state).allowAnyClick && e.button !== 0) return false;
    if (!n || !n.ownerDocument || !n.ownerDocument.body) {
      throw new Error('No ref element found on DragStart!');
    }
    const { ownerDocument } = n;

    if (
      get(state).disabled ||
      !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
      (get(state).handle && !matchesSelectorAndParentsTo(e.target, get(state).handle, n)) ||
      (get(state).cancel && matchesSelectorAndParentsTo(e.target, get(state).cancel, n))
    ) {
      return;
    }

    const isTouch = e.type === 'touchstart';
    if (isTouch) e.preventDefault();
    get(state).touch = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touch: get(state).touch,
      node: n,
      offsetContainer: get(state).offsetParent,
      scale: get(state).scale
    });
    if (position == null) return;
    const { x, y } = position;
    const coreEvent = createCoreData({
      node: n,
      x,
      y,
      lastX: get(pos)[0],
      lastY: get(pos)[1]
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);

    const shouldUpdate = get(state).start?.(e, coreEvent);
    onDragStartHook.trigger({ event: e, data: coreEvent });
    if ((shouldUpdate || get(state).update) === false) return false;

    if (get(state).enableUserSelectHack) addUserSelectStyles(ownerDocument);

    get(state).dragging = true;
    get(pos)[0] = x;
    get(pos)[1] = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    const n = get(node);
    if (n) {
      const position = getControlPosition({
        e,
        touch: get(state).touch,
        node: n,
        offsetContainer: get(state).offsetParent,
        scale: get(state).scale
      });
      if (position == null) return;
      let { x, y } = position;

      // Snap to grid if prop has been provided
      const grid = get(state).grid;
      if (grid && Array.isArray(grid)) {
        let deltaX = x - get(pos)[0],
          deltaY = y - get(pos)[1];
        [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = get(pos)[0] + deltaX;
        y = get(pos)[1] + deltaY;
      }

      const coreEvent = createCoreData({
        node: n,
        x,
        y,
        lastX: get(pos)[0],
        lastY: get(pos)[1]
      });

      log('DraggableCore: handleDrag: %j', coreEvent);

      const shouldUpdate = get(state).move?.(e, coreEvent);
      onDragHook.trigger({ event: e, data: coreEvent });
      if ((shouldUpdate || get(state).update) === false) {
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

      get(pos)[0] = x;
      get(pos)[1] = y;
    }
  };

  const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
    const n = get(node);
    if (!get(state).dragging) return;

    if (n) {
      const position = getControlPosition({
        e,
        touch: get(state).touch,
        node: n,
        offsetContainer: get(state).offsetParent,
        scale: get(state).scale
      });
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData({
        node: n,
        x,
        y,
        lastX: get(pos)[0],
        lastY: get(pos)[1]
      });

      const shouldUpdate = get(state).stop?.(e, coreEvent);
      onDragStopHook.trigger({ event: e, data: coreEvent });
      if ((shouldUpdate || get(state).update) === false) return false;

      if (get(state).enableUserSelectHack) removeUserSelectStyles(n.ownerDocument);

      log('DraggableCore: handleDragStop: %j', coreEvent);

      get(state).dragging = false;

      log('DraggableCore: Removing handlers');
      removeEvent(n.ownerDocument, dragEventFor.move, handleDrag);
      removeEvent(n.ownerDocument, dragEventFor.stop, handleDragStop);
    }
  };

  const onMouseDown: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.mouse;
    get(state).mouseDown?.(e);
    if (e.which == 3) return;
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

  const initialized = ref(false);
  const init = () => {
    if (get(node) && !get(initialized)) {
      initialized.value = true;
      useEventListener(get(node), eventsFor.touch.start, onTouchStart, { passive: false });
      useEventListener(get(node), eventsFor.touch.stop, onTouchEnd);
      useEventListener(get(node), eventsFor.mouse.start, onMouseDown);
      useEventListener(get(node), eventsFor.mouse.stop, onMouseUp);
    }
  };

  tryOnMounted(() => {
    node.value = unrefElement(target);
    if (!node) {
      console.error('You are trying to use <DraggableCore> without passing a valid node reference. Canceling initialization.');
      return;
    }
    init();
  });

  return {
    state,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on
  };
};

export default useDraggableCore;
