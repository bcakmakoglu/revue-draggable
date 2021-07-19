import { defineComponent, onMounted, PropType, ref } from 'vue-demi';
import useDraggableCore from '../hooks/useDraggableCore';
import { DraggableCoreProps } from '../utils/types';
import { isVNode } from '../utils/shims';

const DraggableCore = defineComponent({
  name: 'DraggableCore',
  props: {
    scale: {
      type: Number as PropType<DraggableCoreProps['scale']>,
      default: 1
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableCoreProps['allowAnyClick']>,
      default: true
    },
    disabled: {
      type: Boolean as PropType<DraggableCoreProps['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableCoreProps['enableUserSelectHack']>,
      default: true
    },
    onStart: {
      type: Function as PropType<DraggableCoreProps['onStart']>,
      default: () => {}
    },
    onDrag: {
      type: Function as PropType<DraggableCoreProps['onDrag']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableCoreProps['onStop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableCoreProps['onMouseDown']>,
      default: () => {}
    },
    cancel: {
      type: String as PropType<DraggableCoreProps['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableCoreProps['offsetParent']>,
      default: undefined
    },
    grid: {
      type: Array as unknown as PropType<DraggableCoreProps['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableCoreProps['handle']>,
      default: undefined
    },
    nodeRef: {
      type: Object as PropType<DraggableCoreProps['nodeRef']>,
      default: undefined
    }
  },
  emits: ['core-start', 'core-move', 'core-stop'],
  setup(props, { slots }) {
    const nodeRef = ref<DraggableCoreProps['nodeRef'] | null>(props.nodeRef ?? null);

    onMounted(() => {
      const node = nodeRef.value && isVNode(nodeRef.value) ? (nodeRef.value as any).$el : nodeRef.value;
      useDraggableCore({
        ...(props as DraggableCoreProps),
        nodeRef: node
      });
    });

    return () => (slots.default ? slots.default().map((node) => <node ref={nodeRef} />) : []);
  }
});

export default DraggableCore;
