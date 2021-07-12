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

import type { EventHandler, MouseTouchEvent } from './utils/types';
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue';
import { DraggableProps } from './Draggable';

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

type DraggableCoreState = {
  dragging: boolean;
  lastX: number;
  lastY: number;
  touchIdentifier: number;
};

export type DraggableData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

export type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;

export type ControlPosition = { x: number; y: number };
export type PositionOffsetControlPosition = { x: number | string; y: number | string };

export type DraggableCoreDefaultProps = {
  allowAnyClick: boolean;
  disabled: boolean;
  enableUserSelectHack: boolean;
  onStart: DraggableEventHandler;
  onDrag: DraggableEventHandler;
  onStop: DraggableEventHandler;
  onMouseDown: (e: MouseEvent) => void;
  scale: number;
};

export type DraggableCoreProps = {
  cancel: string;
  offsetParent: HTMLElement;
  grid: [number, number];
  handle: string;
  nodeRef?: any;
} & DraggableCoreDefaultProps;

const DraggableCore = defineComponent({
  name: 'DraggableCore',
  props: {
    scale: {
      type: Number as PropType<DraggableProps['scale']>,
      default: 1
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableProps['allowAnyClick']>,
      default: false
    },
    disabled: {
      type: Boolean as PropType<DraggableProps['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableProps['enableUserSelectHack']>,
      default: true
    },
    onStart: {
      type: Function as PropType<DraggableProps['onStart']>,
      default: () => {}
    },
    onDrag: {
      type: Function as PropType<DraggableProps['onDrag']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableProps['onStop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableProps['onMouseDown']>,
      default: () => {}
    },
    cancel: {
      type: String as PropType<DraggableProps['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableProps['offsetParent']>,
      default: () => {}
    },
    grid: {
      type: Array as unknown as PropType<DraggableProps['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableProps['handle']>,
      default: undefined
    },
    nodeRef: {
      type: Object as PropType<DraggableProps['nodeRef']>,
      default: undefined as any
    }
  },
  setup(props, { slots }) {
    const nodeRef = ref<HTMLElement | null>(null);
    const dragging = ref(false);
    const lastX = ref<number>(NaN);
    const lastY = ref<number>(NaN);
    const touchIdentifier = ref<number | undefined>();

    const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
      props.onMouseDown(e);

      if (!props.allowAnyClick && typeof e.button === 'number' && e.button !== 0) return false;

      if (!nodeRef.value || !nodeRef.value.ownerDocument || !nodeRef.value.ownerDocument.body) {
        throw new Error('<DraggableCore> not mounted on DragStart!');
      }
      const { ownerDocument } = nodeRef.value;

      if (
        props.disabled ||
        !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
        (props.handle && !matchesSelectorAndParentsTo(e.target, props.handle, nodeRef.value)) ||
        (props.cancel && matchesSelectorAndParentsTo(e.target, props.cancel, nodeRef.value))
      ) {
        return;
      }

      if (e.type === 'touchstart') e.preventDefault();

      touchIdentifier.value = getTouchIdentifier(e);

      const position = getControlPosition({
        e,
        touchIdentifier: touchIdentifier.value,
        node: nodeRef.value,
        offsetContainer: props.nodeRef,
        scale: props.scale
      });
      if (position == null) return;
      const { x, y } = position;

      const coreEvent = createCoreData({
        node: nodeRef.value,
        x,
        y,
        lastX: lastX.value,
        lastY: lastY.value
      });

      log('DraggableCore: handleDragStart: %j', coreEvent);

      log('calling', props.onStart);
      const shouldUpdate = props.onStart(e, coreEvent);
      if (shouldUpdate === false) return;

      if (props.enableUserSelectHack) addUserSelectStyles(ownerDocument);

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
        node: nodeRef.value as HTMLElement,
        offsetContainer: props.nodeRef,
        scale: props.scale
      });
      if (position == null) return;
      let { x, y } = position;

      // Snap to grid if prop has been provided
      if (Array.isArray(props.grid)) {
        let deltaX = x - lastX.value,
          deltaY = y - lastY.value;
        [deltaX, deltaY] = snapToGrid(props.grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = lastX.value + deltaX;
        y = lastY.value + deltaY;
      }

      const coreEvent = createCoreData({
        node: nodeRef.value as HTMLElement,
        x,
        y,
        lastX: lastX.value,
        lastY: lastY.value
      });

      log('DraggableCore: handleDrag: %j', coreEvent);

      // Call event handler. If it returns explicit false, trigger end.
      const shouldUpdate = props.onDrag(e, coreEvent);
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
        node: nodeRef.value as HTMLElement,
        offsetContainer: props.nodeRef,
        scale: props.scale
      });
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData({
        node: nodeRef.value as HTMLElement,
        x,
        y,
        lastX: lastX.value,
        lastY: lastY.value
      });

      // Call event handler
      const shouldContinue = props.onStop(e, coreEvent);
      if (shouldContinue === false) return false;

      if (nodeRef.value) {
        // Remove user-select hack
        if (props.enableUserSelectHack) removeUserSelectStyles(nodeRef.value.ownerDocument as any);
      }

      log('DraggableCore: handleDragStop: %j', coreEvent);

      dragging.value = false;
      lastX.value = NaN;
      lastY.value = NaN;

      if (nodeRef.value) {
        // Remove event handlers
        log('DraggableCore: Removing handlers');
        removeEvent(nodeRef.value.ownerDocument as any, dragEventFor.move, handleDrag);
        removeEvent(nodeRef.value.ownerDocument as any, dragEventFor.stop, handleDragStop);
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

    onMounted(() => {
      if (nodeRef.value) {
        addEvent(nodeRef.value as any, eventsFor.touch.start, onTouchStart, { passive: false });
      }
    });

    onBeforeUnmount(() => {
      if (nodeRef.value) {
        const { ownerDocument } = nodeRef.value;
        removeEvent(ownerDocument, eventsFor.mouse.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.touch.move, handleDrag);
        removeEvent(ownerDocument, eventsFor.mouse.stop, handleDragStop);
        removeEvent(ownerDocument, eventsFor.touch.stop, handleDragStop);
        removeEvent(nodeRef.value, eventsFor.touch.start, onTouchStart, { passive: false });
        if (props.enableUserSelectHack) removeUserSelectStyles(ownerDocument);
      }
    });

    return () => (
      <>
        {slots.default
          ? slots
              .default()
              .map((node) => <node ref={nodeRef} onMousedown={onMouseDown} onMouseup={onMouseUp} onTouchend={onTouchEnd} />)
          : []}
      </>
    );
  }
});

export default DraggableCore;
