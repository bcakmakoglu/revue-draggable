import { h, defineComponent, PropType, isVue3 } from 'vue-demi';
import { DraggableCoreOptions } from '../utils/types';
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
    }
  },
  emits: ['start', 'move', 'stop'],
  setup(props, { slots, emit }) {
    const target = templateRef('core-target', null);

    const { onDrag, onDragStart, onDragStop } = useDraggableCore(target, props);

    onDrag((dragEvent) => {
      emit('move', dragEvent);
    });

    onDragStart((dragStartEvent) => {
      emit('start', dragStartEvent);
    });

    onDragStop((dragStopEvent) => {
      emit('stop', dragStopEvent);
    });

    if (isVue3) {
      return () => {
        if (slots.default) return slots.default()?.map((node) => h(node, { ref: 'core-target' }));
      };
    } else {
      return () => {
        if (slots.default) return h('div', { ref: 'core-target' }, slots.default());
      };
    }
  }
});

export default DraggableCore;
