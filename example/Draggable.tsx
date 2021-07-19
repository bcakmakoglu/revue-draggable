import { defineComponent, onMounted, PropType, ref } from 'vue-demi';
import DraggableCore from './DraggableCore';
import { DraggableOptions, useDraggable } from '../src';
import { isVNode } from '../src/utils/shims';

const Draggable = defineComponent({
  name: 'Draggable',
  components: { DraggableCore },
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
    onStart: {
      type: Function as PropType<DraggableOptions['onStart']>,
      default: () => {}
    },
    onDrag: {
      type: Function as PropType<DraggableOptions['onDrag']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableOptions['onStop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableOptions['onMouseDown']>,
      default: () => {}
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
    nodeRef: {
      type: Object as PropType<DraggableOptions['nodeRef']>,
      default: undefined
    }
  },
  emits: ['drag-start', 'drag-move', 'drag-stop', 'transformed', 'core-start', 'core-move', 'core-stop'],
  setup(props, { slots }) {
    const nodeRef = ref<DraggableOptions['nodeRef'] | null>(props.nodeRef ?? null);

    onMounted(() => {
      const node = nodeRef.value && isVNode(nodeRef.value) ? (nodeRef.value as any).$el : nodeRef.value;
      useDraggable({
        ...(props as DraggableOptions),
        nodeRef: node
      });
    });

    return () => (slots.default ? slots.default().map((node) => <node ref={nodeRef} />) : []);
  }
});

export default Draggable;
