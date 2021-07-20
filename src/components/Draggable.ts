import { h, defineComponent, PropType, isVue3, Ref } from 'vue-demi';
import { DraggableOptions } from '../utils/types';
import useDraggable from '../hooks/useDraggable';
import { templateRef } from '@vueuse/core';

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
  setup(props, { slots, emit }) {
    const init = (targets: Ref[]) => {
      targets.forEach((target) => {
        const { onDrag, onDragStart, onDragStop, onTransformed } = useDraggable(target, props);

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
      });
    };

    if (isVue3) {
      const targets = slots.default?.().map((slot, i) => templateRef(`target-${i}`, null));
      targets && init(targets);
      return () => {
        if (slots.default) return slots.default()?.map((node, i) => h(node, { ref: `target-${i}` }));
      };
    } else {
      const target = templateRef('target', null);
      init([target]);
      return () => {
        if (slots.default) return h('div', { ref: 'target' }, slots.default());
      };
    }
  }
});

export default Draggable;
