import DraggableCore from './DraggableCore';
import { defineComponent, onBeforeUnmount, onMounted, computed, ref, PropType, onUpdated } from 'vue-demi';
import { DraggableProps } from '../utils/types';
import { useDraggable } from '../index';

const Draggable = defineComponent({
  name: 'Draggable',
  components: { DraggableCore },
  props: {
    axis: {
      type: String as PropType<DraggableProps['axis']>,
      default: 'both'
    },
    bounds: {
      type: [Object, String, Boolean] as PropType<DraggableProps['bounds']>,
      default: false
    },
    defaultClassName: {
      type: String as PropType<DraggableProps['defaultClassName']>,
      default: 'revue-draggable'
    },
    defaultClassNameDragging: {
      type: String as PropType<DraggableProps['defaultClassNameDragging']>,
      default: 'revue-draggable-dragging'
    },
    defaultClassNameDragged: {
      type: String as PropType<DraggableProps['defaultClassNameDragged']>,
      default: 'revue-draggable-dragged'
    },
    defaultPosition: {
      type: Object as PropType<DraggableProps['defaultPosition']>,
      default: () => ({ x: 0, y: 0 })
    },
    scale: {
      type: Number as PropType<DraggableProps['scale']>,
      default: 1
    },
    position: {
      type: Object as PropType<DraggableProps['position']>,
      default: undefined
    },
    positionOffset: {
      type: Object as PropType<DraggableProps['positionOffset']>,
      default: undefined
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableProps['allowAnyClick']>,
      default: true
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
    }
  },
  setup(props, { slots }) {
    const nodeRef = ref<HTMLElement | null>(null);
    const draggable = computed(() => nodeRef.value && useDraggable(nodeRef.value, props as DraggableProps));

    onUpdated(() => {
      draggable.value?.onUpdated();
    });
    onMounted(() => {
      draggable.value?.onMounted();
      draggable.value?.core.onMounted();
    });
    onBeforeUnmount(() => {
      draggable.value?.onBeforeUnmount();
      draggable.value?.core.onBeforeUnmount();
    });

    return () =>
      slots.default
        ? slots
            .default()
            .map((node) => (
              <node
                ref={nodeRef}
                class={draggable.value?.transformation.value.class}
                style={draggable.value?.transformation.value.style}
                transform={draggable.value?.transformation.value.svgTransform}
                onMousedown={draggable.value?.core.onMouseDown}
                onMouseUp={draggable.value?.core.onMouseUp}
                onTouchend={draggable.value?.core.onTouchEnd}
              />
            ))
        : [];
  }
});

export default Draggable;
