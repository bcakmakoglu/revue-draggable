import { defineComponent, onMounted, PropType, ref } from 'vue-demi';
import DraggableCore from './DraggableCore';
import { DraggableProps, useDraggable } from '../src';
import { isVNode } from '../src/utils/shims';

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
    },
    nodeRef: {
      type: Object as PropType<DraggableProps['nodeRef']>,
      default: undefined
    }
  },
  emits: ['drag-start', 'drag-move', 'drag-stop', 'transformed', 'core-start', 'core-move', 'core-stop'],
  setup(props, { slots }) {
    const nodeRef = ref<DraggableProps['nodeRef'] | null>(props.nodeRef ?? null);

    onMounted(() => {
      const node = nodeRef.value && isVNode(nodeRef.value) ? (nodeRef.value as any).$el : nodeRef.value;
      useDraggable({
        ...(props as DraggableProps),
        nodeRef: node
      });
    });

    return () => (slots.default ? slots.default().map((node) => <node ref={nodeRef} />) : []);
  }
});

export default Draggable;
