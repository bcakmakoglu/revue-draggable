import { computed, defineComponent, onMounted, ref } from 'vue';
import { DraggableEventHandler, EventHandler, MouseTouchEvent } from './utils/types';
import log from './utils/log';
import { createCoreData, createDraggableData, getBoundPosition, getControlPosition, snapToGrid } from './utils/positionFns';
import {
  addEvent,
  addUserSelectStyles,
  createCSSTransform,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles
} from './utils/domFns';

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

const SimpleDrag = defineComponent({
  setup(props, { slots }) {
    const nodeRef = ref<HTMLElement | null>(null);
    const dragging = ref(false);
    const dragged = ref(false);
    const x = ref<number>(NaN);
    const y = ref<number>(NaN);
    const touchIdentifier = ref<number | undefined>();

    const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
      console.log('starting drag');
      if (!nodeRef.value || !nodeRef.value.ownerDocument || !nodeRef.value.ownerDocument.body) {
        throw new Error('<DraggableCore> not mounted on DragStart!');
      }
      const { ownerDocument } = nodeRef.value;

      if (e.type === 'touchstart') e.preventDefault();

      touchIdentifier.value = getTouchIdentifier(e);

      const position = getControlPosition({
        e,
        touchIdentifier: touchIdentifier.value,
        node: nodeRef.value,
        offsetContainer: undefined as any,
        scale: 1
      });
      if (position == null) return;

      const coreEvent = createCoreData({
        node: nodeRef.value,
        x: position.x,
        y: position.y,
        lastX: x.value,
        lastY: y.value
      });

      log('DraggableCore: handleDragStart: %j', coreEvent);

      dragging.value = true;

      addEvent(ownerDocument, dragEventFor.move, handleDrag);
      addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
    };

    const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
      const position = getControlPosition({
        e,
        touchIdentifier: touchIdentifier.value,
        node: nodeRef.value as HTMLElement,
        offsetContainer: undefined as any,
        scale: 1
      });
      if (position == null) return;

      const coreEvent = createCoreData({
        node: nodeRef.value as HTMLElement,
        x: position.x,
        y: position.y
      });

      const uiData = createDraggableData({
        coreData: coreEvent,
        x: coreEvent.x,
        y: coreEvent.y,
        scale: 1
      });
      console.log(uiData);

      x.value = uiData.x;
      y.value = uiData.y;

      log('DraggableCore: handleDrag: %j', coreEvent);
    };

    const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
      if (!dragging.value) return;

      const position = getControlPosition({
        e,
        touchIdentifier: touchIdentifier.value,
        node: nodeRef.value as HTMLElement,
        offsetContainer: undefined as any,
        scale: 1
      });
      if (position == null) return;
      const coreEvent = createCoreData({
        node: nodeRef.value as HTMLElement,
        x: position.x,
        y: position.y
      });

      log('DraggableCore: handleDragStop: %j', coreEvent);

      dragging.value = false;

      if (nodeRef.value) {
        // Remove event handlers
        log('DraggableCore: Removing handlers');
        removeEvent(nodeRef.value.ownerDocument as any, dragEventFor.move, handleDrag);
        removeEvent(nodeRef.value.ownerDocument as any, dragEventFor.stop, handleDragStop);
      }
    };
    const transformOpts = computed(() => {
      return {
        x: x.value,
        y: y.value
      };
    });
    const style = computed(() => createCSSTransform(transformOpts.value, undefined as any));

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

    return () => (
      <>
        {slots.default
          ? slots
              .default()
              .map((node) => (
                <node
                  ref={nodeRef}
                  style={style.value}
                  class="revue-draggable"
                  id={'foo'}
                  onMousedown={onMouseDown}
                  onMouseup={onMouseUp}
                  onTouchend={onTouchEnd}
                />
              ))
          : []}
      </>
    );
  }
});

export default SimpleDrag;
