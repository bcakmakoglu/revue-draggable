import { h, defineComponent, PropType, Ref, onUpdated, ref } from 'vue-demi';
import { syncRef, templateRef } from '@vueuse/core';
import { DraggableOptions } from '../utils/types';
import useDraggable from '../hooks/useDraggable';

const Draggable = defineComponent({
  name: 'Draggable',
  props: {
    axis: {
      type: String as PropType<DraggableOptions['axis']>,
      default: 'both'
    },
    bounds: {
      type: [Object, String, Boolean] as PropType<DraggableOptions['bounds']>,
      default: false
    },
    defaultClassName: {
      type: String as PropType<DraggableOptions['defaultClassName']>,
      default: 'revue-draggable'
    },
    defaultClassNameDragging: {
      type: String as PropType<DraggableOptions['defaultClassNameDragging']>,
      default: 'revue-draggable-dragging'
    },
    defaultClassNameDragged: {
      type: String as PropType<DraggableOptions['defaultClassNameDragged']>,
      default: 'revue-draggable-dragged'
    },
    defaultPosition: {
      type: Object as PropType<DraggableOptions['defaultPosition']>,
      default: () => ({ x: 0, y: 0 })
    },
    scale: {
      type: Number as PropType<DraggableOptions['scale']>,
      default: 1
    },
    position: {
      type: Object as PropType<DraggableOptions['position']>,
      default: undefined
    },
    positionOffset: {
      type: Object as PropType<DraggableOptions['positionOffset']>,
      default: undefined
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableOptions['allowAnyClick']>,
      default: true
    },
    disabled: {
      type: Boolean as PropType<DraggableOptions['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableOptions['enableUserSelectHack']>,
      default: true
    },
    cancel: {
      type: String as PropType<DraggableOptions['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableOptions['offsetParent']>,
      default: () => {}
    },
    grid: {
      type: Array as unknown as PropType<DraggableOptions['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableOptions['handle']>,
      default: undefined
    },
    update: {
      type: Boolean as PropType<DraggableOptions['update']>,
      default: true
    },
    start: {
      type: Function as PropType<DraggableOptions['start']>,
      default: () => {}
    },
    move: {
      type: Function as PropType<DraggableOptions['move']>,
      default: () => {}
    },
    stop: {
      type: Function as PropType<DraggableOptions['stop']>,
      default: () => {}
    }
  },
  emits: ['move', 'start', 'stop', 'transformed'],
  setup(props, { slots, emit, attrs }) {
    const draggableState = ref();
    const init = (target: Ref) => {
      const { onDrag, onDragStart, onDragStop, onTransformed, state } = useDraggable(target, props);
      syncRef(state, draggableState);

      onDrag((dragEvent) => {
        emit('move', dragEvent);
      });

      onDragStart((dragStartEvent) => {
        emit('start', dragStartEvent);
      });

      onDragStop((dragStopEvent) => {
        emit('stop', dragStopEvent);
      });

      onTransformed((transformEvent) => {
        emit('transformed', transformEvent);
      });

      onUpdated(() => {
        state.value = { ...state.value, ...props };
      });
    };

    const target = templateRef('target', null);
    init(target);
    return () => {
      if (slots.default) return h(slots.default()[0], { ref: 'target', ...attrs }, {});
    };
  }
});

export default Draggable;
