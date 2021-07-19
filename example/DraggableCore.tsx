import { defineComponent, onMounted, PropType, ref } from 'vue-demi';
import { useDraggableCore, DraggableCoreOptions } from '../src';
import { isVNode } from '../src/utils/shims';

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
    onStart: {
      type: Function as PropType<DraggableCoreOptions['onStart']>,
      default: () => {}
    },
    onDrag: {
      type: Function as PropType<DraggableCoreOptions['onDrag']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableCoreOptions['onStop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableCoreOptions['onMouseDown']>,
      default: () => {}
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
    nodeRef: {
      type: Object as PropType<DraggableCoreOptions['nodeRef']>,
      default: undefined
    }
  },
  emits: ['core-start', 'core-move', 'core-stop'],
  setup(props, { slots }) {
    const nodeRef = ref<DraggableCoreOptions['nodeRef'] | null>(props.nodeRef ?? null);

    onMounted(() => {
      const node = nodeRef.value && isVNode(nodeRef.value) ? (nodeRef.value as any).$el : nodeRef.value;
      useDraggableCore({
        ...(props as DraggableCoreOptions),
        nodeRef: node
      });
    });

    return () => (slots.default ? slots.default().map((node) => <node ref={nodeRef} />) : []);
  }
});

export default DraggableCore;
