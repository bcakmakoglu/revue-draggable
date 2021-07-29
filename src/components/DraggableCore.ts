import { h, defineComponent, PropType, onUpdated, isVue3 } from 'vue-demi';
import { DraggableCoreOptions, DraggableOptions } from '../utils/types';
import useDraggableCore from '../hooks/useDraggableCore';
import { templateRef } from '@vueuse/core';

const DraggableCore = defineComponent({
  name: 'DraggableCore',
  props: {
    scale: {
      type: Number as PropType<DraggableCoreOptions['scale']>,
      default: 1
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableCoreOptions['allowAnyClick']>,
      default: true
    },
    disabled: {
      type: Boolean as PropType<DraggableCoreOptions['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableCoreOptions['enableUserSelectHack']>,
      default: true
    },
    cancel: {
      type: String as PropType<DraggableCoreOptions['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableCoreOptions['offsetParent']>,
      default: undefined
    },
    grid: {
      type: Array as unknown as PropType<DraggableCoreOptions['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableCoreOptions['handle']>,
      default: undefined
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
  emits: ['start', 'move', 'stop'],
  setup(props, { slots, emit, attrs }) {
    const target = templateRef('core-target', null);

    const { onDrag, onDragStart, onDragStop, state } = useDraggableCore(target, props);

    onDrag((dragEvent) => {
      emit('move', dragEvent);
    });

    onDragStart((dragStartEvent) => {
      emit('start', dragStartEvent);
    });

    onDragStop((dragStopEvent) => {
      emit('stop', dragStopEvent);
    });

    onUpdated(() => {
      state.value = { ...state.value, ...props };
    });

    if (isVue3) {
      return () => {
        if (slots.default) {
          return h(slots.default()[0], { ref: 'core-target', ...attrs }, {});
        }
      };
    } else {
      return () => {
        if (slots.default) {
          return h('div', { ref: 'core-target', ...attrs }, slots.default());
        }
      };
    }
  }
});

export default DraggableCore;
